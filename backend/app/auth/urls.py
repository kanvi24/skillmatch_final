from django.urls import path
from app.auth.views import (
    RegisterView,
    LoginView,
    AdminLoginView,
    MeView,
    ProfileUpdateView,
    AdminUserListView,
    AdminUserRoleUpdateView,
    AdminUserDeleteView,
)

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("login", LoginView.as_view(), name="login"),
    path("admin-login", AdminLoginView.as_view(), name="admin-login"),
    path("me", MeView.as_view(), name="me"),
    path("profile", ProfileUpdateView.as_view(), name="profile"),
    path("admin/users", AdminUserListView.as_view(), name="admin-user-list"),
    path("admin/users/<str:user_id>/role", AdminUserRoleUpdateView.as_view(), name="admin-user-role"),
    path("admin/users/<str:user_id>", AdminUserDeleteView.as_view(), name="admin-user-delete"),
]
