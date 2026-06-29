from rest_framework import permissions

from .models import Role


class IsCreator(permissions.BasePermission):
    """Writes require the CREATOR role; reads are open. The role is re-checked
    here on every request, so the frontend claim is never the security boundary."""

    message = "Creator role required."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and hasattr(user, "profile")
            and user.profile.role == Role.CREATOR
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level guard for detail routes. Reads are open; writes require the
    requester to own the object. The owner attribute defaults to ``creator`` and
    can be overridden per-view via ``owner_field``."""

    message = "You can only modify your own resources."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner_field = getattr(view, "owner_field", "creator")
        return getattr(obj, owner_field, None) == request.user
