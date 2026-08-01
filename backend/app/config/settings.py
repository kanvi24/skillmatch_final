import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-super-secret-key-skillmatch")

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Application definition
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "app.auth.apps.AuthConfig",  # Our Custom Auth App
    "app.resume.apps.ResumeConfig", # Our Custom Resume App
    "app.company.apps.CompanyConfig", # Our Custom Company App
    "app.analytics.apps.AnalyticsConfig", # Pandas/EDA/ML/DL analytics app
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "app.config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "app.config.wsgi.application"

# Dummy Database config to satisfy Django requirements
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# MongoDB Config (accessed customly in app/database/db.py)
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "skillmatch")

# JWT configurations
JWT_SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkeythatshouldbechangedinproduction")
JWT_ALGORITHM = "HS256"
JWT_EXP_MINUTES = 60 * 24 * 7  # 7 days

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = True  # For local development
CORS_ALLOW_CREDENTIALS = True

# REST Framework settings
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "app.auth.authentication.JWTAuthentication",
    ],
}

# Swagger settings
SPECTACULAR_SETTINGS = {
    "TITLE": "SkillMatch AI API",
    "DESCRIPTION": "Django REST Framework backend for SkillMatch AI Resume and Career Recommendation System.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SECURITY": [
        {
            "jwtAuth": [],
        }
    ],
    "APPEND_COMPONENTS": {
        "securitySchemes": {
            "jwtAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Enter your JWT token. Do NOT include 'Bearer ' prefix, just paste the token string directly.",
            }
        }
    }
}
