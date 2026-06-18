from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from apps.accounts.roles import Roles


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "password", "email", "phone", "full_name")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data, role=Roles.CUSTOMER, is_active=False)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    customer_profile_id = serializers.SerializerMethodField()
    employee_profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "phone", "full_name", "role", "account_status", "is_active", "customer_profile_id", "employee_profile_id")
        read_only_fields = ("role", "account_status", "is_active", "customer_profile_id", "employee_profile_id")

    def get_customer_profile_id(self, obj):
        profile = getattr(obj, "customer_profile", None)
        return profile.id if profile else None

    def get_employee_profile_id(self, obj):
        profile = getattr(obj, "employee_profile", None)
        return profile.id if profile else None


class ManagerUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "password", "email", "phone", "full_name", "role", "account_status", "is_active")

    def create(self, validated_data):
        password = validated_data.pop("password", None) or "ChangeMe123!"
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
