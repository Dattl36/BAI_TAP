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
        if self.action in {"register", "login"}:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        create_customer_profile_for_user(user)
        return success(UserSerializer(user).data, "Registered", status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = RefreshToken.for_user(serializer.validated_data["user"])
        return success({"refresh": str(refresh), "access": str(refresh.access_token)})

    @action(detail=False, methods=["post"])
    def logout(self, request):
        return success(message="Logged out")

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "PATCH":
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return success(serializer.data, "Profile updated")
        return success(UserSerializer(request.user).data)


class AccountViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = ManagerUserSerializer
    permission_classes = [IsManager]

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        deactivate_user(request.user, user)
        return success(UserSerializer(user).data, "Account deactivated")
