from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Allows access only to authenticated users whose role is 'admin'.
    Must be combined with IsAuthenticated (role only exists on a valid user).
    """

    message = "This action requires admin access."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(user and getattr(user, "is_authenticated", False) and getattr(user, "role", "user") == "admin")
