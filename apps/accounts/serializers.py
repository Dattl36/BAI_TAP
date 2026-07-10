import re

from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from apps.accounts.roles import Roles


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=160, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "username", "password", "email", "phone", "full_name")

    def validate_username(self, value):
        username = value.strip()
        if not username:
            raise serializers.ValidationError("Vui lòng nhập tên đăng nhập.")
        if " " in username:
            raise serializers.ValidationError("Tên đăng nhập không được chứa dấu cách. Hãy nhập họ và tên ở ô bên dưới.")
        if not re.match(r"^[\w.@+-]+$", username):
            raise serializers.ValidationError("Tên đăng nhập chỉ được dùng chữ, số và các ký tự @/./+/-/_.")
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("Tên đăng nhập này đã tồn tại.")
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email này đã được sử dụng.")
        return email

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data, role=Roles.CUSTOMER, is_active=True)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Tên đăng nhập hoặc mật khẩu không chính xác.")
        attrs["user"] = user
        return attrs


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class VerifyEmailSerializer(EmailSerializer):
    otp = serializers.RegexField(regex=r"^\d{6}$")


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
        
        if user.role in {Roles.RECEPTIONIST, Roles.STAFF, Roles.MANAGER}:
            from apps.employees.models import EmployeeProfile
            EmployeeProfile.objects.create(
                user=user,
                role_type=user.role,
                full_name=user.full_name,
                phone=user.phone,
            )
            
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)
            
        old_role = instance.role
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if 'role' in validated_data and old_role != instance.role:
            if instance.role in {Roles.RECEPTIONIST, Roles.STAFF, Roles.MANAGER}:
                from apps.employees.models import EmployeeProfile
                profile, created = EmployeeProfile.objects.get_or_create(
                    user=instance,
                    defaults={
                        'role_type': instance.role,
                        'full_name': instance.full_name,
                        'phone': instance.phone,
                    }
                )
                if not created:
                    profile.role_type = instance.role
                    profile.save(update_fields=['role_type'])
                    
        return instance
