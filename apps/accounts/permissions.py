from rest_framework.permissions import BasePermission

from apps.accounts.roles import Roles, has_role


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, Roles.MANAGER)


class IsReceptionistOrManager(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, Roles.RECEPTIONIST, Roles.MANAGER)


class IsStaffOrManager(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, Roles.STAFF, Roles.MANAGER)


class RolePermission(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        allowed = getattr(view, "allowed_roles", self.allowed_roles)
        return has_role(request.user, *allowed)
