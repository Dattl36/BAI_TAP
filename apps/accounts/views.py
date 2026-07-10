from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.permissions import IsManager
from apps.accounts.serializers import (
    LoginSerializer,
    ManagerUserSerializer,
    RegisterSerializer,
    UserSerializer,
    PhoneSerializer,
    VerifyOtpSerializer,
)
from apps.accounts.services import create_customer_profile_for_user, deactivate_user, send_registration_otp, verify_registration_otp
from apps.core.exceptions import BusinessError
from apps.core.responses import success


class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    throttle_scope = None

    def get_permissions(self):
        if self.action in {"register", "login", "verify_otp", "resend_otp"}:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_throttles(self):
        if self.action in {"register", "resend_otp"}:
            self.throttle_scope = "otp_send"
        elif self.action == "verify_otp":
            self.throttle_scope = "otp_verify"
        else:
            self.throttle_scope = None
        return super().get_throttles()

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        create_customer_profile_for_user(user)
        otp_code = send_registration_otp(user)
        return success({"message": f"Đăng ký thành công! Mã OTP của bạn là {otp_code}", "phone": user.phone, "otp_code": otp_code, "id": user.id}, "Registered", status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="verify-otp")
    def verify_otp(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        verify_registration_otp(phone, serializer.validated_data["otp"])

        user = User.objects.filter(phone=phone).first()
        if not user:
            raise BusinessError("Mã xác minh không hợp lệ hoặc đã hết hạn")

        user.is_active = True
        user.save(update_fields=["is_active"])

        refresh = RefreshToken.for_user(user)
        return success({"refresh": str(refresh), "access": str(refresh.access_token)}, "Xác minh tài khoản thành công")

    @action(detail=False, methods=["post"], url_path="resend-otp")
    def resend_otp(self, request):
        serializer = PhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        user = User.objects.filter(phone=phone, is_active=False).first()
        if not user:
            raise BusinessError("Nếu tài khoản cần xác minh, mã OTP mới sẽ được gửi.")

        otp_code = send_registration_otp(user, enforce_resend_limits=True)
        return success({"message": f"Đã gửi lại mã OTP: {otp_code}", "otp_code": otp_code})

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = RefreshToken.for_user(serializer.validated_data["user"])
        return success({"refresh": str(refresh), "access": str(refresh.access_token)})

    @action(detail=False, methods=["post"])
    def logout(self, request):
        return success(message="Da dang xuat")

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "PATCH":
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return success(serializer.data, "Ho so da duoc cap nhat")
        return success(UserSerializer(request.user).data)


class AccountViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = ManagerUserSerializer
    permission_classes = [IsManager]

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        deactivate_user(request.user, user)
        return success(UserSerializer(user).data, "Tai khoan da duoc vo hieu hoa")
