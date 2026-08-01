from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema
from bson import ObjectId
from app.auth.serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserResponseSerializer,
    UserProfileUpdateSerializer,
    AdminUserSerializer,
    AdminRoleUpdateSerializer,
)
from app.auth.service import AuthService, create_access_token
from app.auth.permissions import IsAdmin
from app.database.db import get_db

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=UserRegisterSerializer,
        responses={201: UserResponseSerializer},
        summary="Register a new candidate",
    )
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            if AuthService.get_user_by_email(email):
                return Response(
                    {"detail": "A user with this email address already exists"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = AuthService.create_user(
                name=serializer.validated_data["name"],
                email=email,
                password=serializer.validated_data["password"],
            )
            user_data = {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user"),
                "title": user.get("title", ""),
                "bio": user.get("bio", ""),
                "phone": user.get("phone", ""),
                "location": user.get("location", ""),
                "website": user.get("website", ""),
                "github": user.get("github", ""),
                "linkedin": user.get("linkedin", ""),
            }
            return Response(
                UserResponseSerializer(user_data).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=UserLoginSerializer,
        summary="Log in and retrieve JWT access token",
    )
    def post(self, request):
        # We check both standard DRF JSON serializer and fallback payload values
        # context: frontend sends username/password in JSON, standard DRF might expect email/password.
        # We will handle both gracefully!
        data = request.data
        email = data.get("email") or data.get("username")
        password = data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Both email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = AuthService.authenticate_user(email, password)
        if not user:
            return Response(
                {"detail": "Incorrect email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token = create_access_token({"sub": user["email"]})
        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "title": user.get("title", ""),
            "bio": user.get("bio", ""),
            "phone": user.get("phone", ""),
            "location": user.get("location", ""),
            "website": user.get("website", ""),
            "github": user.get("github", ""),
            "linkedin": user.get("linkedin", ""),
        }
        return Response({
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponseSerializer(user_data).data,
        })

class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=UserLoginSerializer,
        summary="Log in as an admin and retrieve JWT access token",
    )
    def post(self, request):
        data = request.data
        email = data.get("email") or data.get("username")
        password = data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Both email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = AuthService.authenticate_user(email, password)
        if not user:
            return Response(
                {"detail": "Incorrect email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.get("role", "user") != "admin":
            return Response(
                {"detail": "This account does not have admin access"},
                status=status.HTTP_403_FORBIDDEN,
            )

        token = create_access_token({"sub": user["email"]})
        user_data = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "title": user.get("title", ""),
            "bio": user.get("bio", ""),
            "phone": user.get("phone", ""),
            "location": user.get("location", ""),
            "website": user.get("website", ""),
            "github": user.get("github", ""),
            "linkedin": user.get("linkedin", ""),
        }
        return Response({
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponseSerializer(user_data).data,
        })

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: UserResponseSerializer},
        summary="Get details of logged-in candidate",
    )
    def get(self, request):
        user = request.user
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": getattr(user, "role", "user"),
            "title": user.title,
            "bio": user.bio,
            "phone": user.phone,
            "location": user.location,
            "website": user.website,
            "github": user.github,
            "linkedin": user.linkedin,
        }
        return Response(UserResponseSerializer(user_data).data)

class ProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=UserProfileUpdateSerializer,
        responses={200: UserResponseSerializer},
        summary="Update profile details of logged-in candidate",
    )
    def put(self, request):
        serializer = UserProfileUpdateSerializer(data=request.data)
        if serializer.is_valid():
            user = AuthService.update_profile(
                user_id=request.user.id,
                name=serializer.validated_data["name"],
                title=serializer.validated_data.get("title", ""),
                bio=serializer.validated_data.get("bio", ""),
                phone=serializer.validated_data.get("phone", ""),
                location=serializer.validated_data.get("location", ""),
                website=str(serializer.validated_data.get("website", "")),
                github=str(serializer.validated_data.get("github", "")),
                linkedin=str(serializer.validated_data.get("linkedin", "")),
            )
            if not user:
                return Response(
                    {"detail": "Candidate user details not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            user_data = {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user"),
                "title": user.get("title", ""),
                "bio": user.get("bio", ""),
                "phone": user.get("phone", ""),
                "location": user.get("location", ""),
                "website": user.get("website", ""),
                "github": user.get("github", ""),
                "linkedin": user.get("linkedin", ""),
            }
            return Response(UserResponseSerializer(user_data).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserListView(APIView):
    """Admin-only: list every registered user with their current role."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(responses={200: AdminUserSerializer(many=True)})
    def get(self, request):
        db = get_db()
        users = list(db.users.find())
        for u in users:
            u["id"] = str(u["_id"])
            u["role"] = u.get("role", "user")
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminUserRoleUpdateView(APIView):
    """Admin-only: promote a user to admin, or demote an admin back to user."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(request=AdminRoleUpdateSerializer, responses={200: AdminUserSerializer})
    def patch(self, request, user_id):
        serializer = AdminRoleUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if str(request.user.id) == user_id and serializer.validated_data["role"] != "admin":
            return Response(
                {"detail": "You can't remove your own admin access."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        db = get_db()
        try:
            obj_id = ObjectId(user_id)
        except Exception:
            return Response({"detail": "Invalid user id"}, status=status.HTTP_400_BAD_REQUEST)

        user = db.users.find_one({"_id": obj_id})
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        db.users.update_one({"_id": obj_id}, {"$set": {"role": serializer.validated_data["role"]}})
        user["role"] = serializer.validated_data["role"]
        user["id"] = str(user["_id"])
        return Response(AdminUserSerializer(user).data, status=status.HTTP_200_OK)

class AdminUserDeleteView(APIView):
    """Admin-only: remove a user account entirely."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def delete(self, request, user_id):
        if str(request.user.id) == user_id:
            return Response(
                {"detail": "You can't delete your own account while logged in as admin."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        db = get_db()
        try:
            obj_id = ObjectId(user_id)
        except Exception:
            return Response({"detail": "Invalid user id"}, status=status.HTTP_400_BAD_REQUEST)

        result = db.users.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"detail": "User deleted"}, status=status.HTTP_200_OK)
