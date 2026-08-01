import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from app.database.db import get_db
from bson import ObjectId

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXP_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

class AuthService:
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        db = get_db()
        return db.users.find_one({"email": email.lower()})

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[dict]:
        db = get_db()
        try:
            return db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def create_user(name: str, email: str, password: str) -> dict:
        db = get_db()
        hashed_password = make_password(password)
        new_user = {
            "name": name,
            "email": email.lower(),
            "hashed_password": hashed_password,
            "role": "user",
            "title": "",
            "bio": "",
            "phone": "",
            "location": "",
            "website": "",
            "github": "",
            "linkedin": ""
        }
        result = db.users.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return new_user

    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[dict]:
        user = AuthService.get_user_by_email(email)
        if not user:
            return None
        if not check_password(password, user["hashed_password"]):
            return None
        return user

    @staticmethod
    def update_profile(user_id: str, name: str, title: str, bio: str, phone: str, location: str, website: str, github: str, linkedin: str) -> Optional[dict]:
        db = get_db()
        try:
            db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {
                    "name": name,
                    "title": title,
                    "bio": bio,
                    "phone": phone,
                    "location": location,
                    "website": website,
                    "github": github,
                    "linkedin": linkedin
                }}
            )
            return db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
