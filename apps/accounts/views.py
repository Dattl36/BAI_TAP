from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.permissions import IsManager
from apps.accounts.serializers import LoginSerializer, ManagerUserSerializer, RegisterSerializer, UserSerializer
from apps.accounts.services import create_customer_profile_for_user, deactivate_user
from apps.core.responses import success


class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action in {"register", "login", "verify_email", "resend_otp"}:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        create_customer_profile_for_user(user)
        
        return success({"message": "Đăng ký thành công!", "email": user.email}, "Registered", status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="verify-email")
    def verify_email(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        if not email or not otp:
            from apps.core.exceptions import BusinessError
            raise BusinessError("Vui lòng nhập Email và mã OTP")
            
        from django.core.cache import cache
        cached_otp = cache.get(f"otp_{email}")
        
        if not cached_otp or str(cached_otp) != str(otp):
            from apps.core.exceptions import BusinessError
            raise BusinessError("Mã xác minh không hợp lệ hoặc đã hết hạn")
            
        user = User.objects.filter(email=email).first()
        if not user:
            from apps.core.exceptions import BusinessError
            raise BusinessError("Không tìm thấy tài khoản")
            
        user.is_active = True
        user.save(update_fields=["is_active"])
        
        cache.delete(f"otp_{email}")
        
        refresh = RefreshToken.for_user(user)
        return success({"refresh": str(refresh), "access": str(refresh.access_token)}, "Xác minh tài khoản thành công")

    @action(detail=False, methods=["post"], url_path="resend-otp")
    def resend_otp(self, request):
        email = request.data.get("email")
        if not email:
            from apps.core.exceptions import BusinessError
            raise BusinessError("Vui lòng nhập Email")
            
        user = User.objects.filter(email=email, is_active=False).first()
        if not user:
            from apps.core.exceptions import BusinessError
            raise BusinessError("Tài khoản không tồn tại hoặc đã được kích hoạt")
            
        import random
        from django.core.cache import cache
        from django.core.mail import send_mail
        otp_code = f"{random.randint(100000, 999999)}"
        cache.set(f"otp_{user.email}", otp_code, timeout=300)
        
        send_mail(
            "Salon App - Mã xác minh đăng ký",
            f"Mã xác minh (OTP) mới của bạn là: {otp_code}\nMã này sẽ hết hạn sau 5 phút.",
            "no-reply@salon.com",
            [user.email],
            fail_silently=False,
        )
        return success({"message": "Đã gửi lại mã OTP"})

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = RefreshToken.for_user(serializer.validated_data["user"])
        return success({"refresh": str(refresh), "access": str(refresh.access_token)})

    @action(detail=False, methods=["post"])
    def logout(self, request):
        return success(message="Đã đăng xuất")

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "PATCH":
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return success(serializer.data, "Hồ sơ đã được cập nhật")
        return success(UserSerializer(request.user).data)


class AccountViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = ManagerUserSerializer
    permission_classes = [IsManager]

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        deactivate_user(request.user, user)
        return success(UserSerializer(user).data, "Tài khoản đã được vô hiệu hóa")
