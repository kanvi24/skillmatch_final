import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from rest_framework import authentication, exceptions
from app.database.db import get_db

# Initialize Firebase Admin on load
if not firebase_admin._apps:
    try:
        # Search in backend root directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        service_account_path = os.path.join(base_dir, "firebase-service-account.json")
        
        firebase_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        google_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        project_id = os.environ.get("FIREBASE_PROJECT_ID") or os.environ.get("GOOGLE_CLOUD_PROJECT")
        
        print(f"DEBUG Firebase Init: firebase_json_length={len(firebase_json) if firebase_json else 0}")
        print(f"DEBUG Firebase Init: google_creds='{google_creds}', exists={os.path.exists(google_creds) if google_creds else False}")
        print(f"DEBUG Firebase Init: service_account_path='{service_account_path}', exists={os.path.exists(service_account_path)}")
        print(f"DEBUG Firebase Init: project_id='{project_id}'")
        
        if firebase_json:
            import json
            # Robust JSON cleaning: strip outer quotes and unescape double-escaped sequences
            cleaned_json = firebase_json.strip()
            if (cleaned_json.startswith('"') and cleaned_json.endswith('"')) or (cleaned_json.startswith("'") and cleaned_json.endswith("'")):
                cleaned_json = cleaned_json[1:-1]
            
            # Replace literal escaped characters if they were double-escaped
            cleaned_json = cleaned_json.replace('\\"', '"').replace('\\n', '\n')
            
            try:
                service_account_info = json.loads(cleaned_json)
            except Exception as parse_err:
                print(f"DEBUG Firebase Init: First JSON parse failed ({parse_err}). Retrying raw...")
                service_account_info = json.loads(firebase_json)
                
            if isinstance(service_account_info, str):
                print("DEBUG Firebase Init: Decoded to string (double-escaped). Parsing again...")
                service_account_info = json.loads(service_account_info)
                
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred)
            print("DEBUG Firebase Init: Initialized successfully with FIREBASE_SERVICE_ACCOUNT_JSON")
        elif google_creds and os.path.exists(google_creds):
            cred = credentials.Certificate(google_creds)
            firebase_admin.initialize_app(cred)
            print(f"DEBUG Firebase Init: Initialized with GOOGLE_APPLICATION_CREDENTIALS file: {google_creds}")
        elif os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("DEBUG Firebase Init: Initialized with service account file path")
        elif project_id:
            firebase_admin.initialize_app(options={
                "projectId": project_id
            })
            print("DEBUG Firebase Init: Initialized with project ID options")
        else:
            # Fallback to default credentials/env variables
            firebase_admin.initialize_app()
            print("DEBUG Firebase Init: Initialized with default credentials fallback")
    except Exception as e:
        print(f"ERROR Firebase Init: Failed to initialize Firebase Admin SDK: {e}")
        import warnings
        warnings.warn(f"Firebase Admin initialization warning: {e}. Ensure service account JSON, environment variable, or project ID is set.")

class MongoUser:
    def __init__(self, data):
        self.id = str(data.get("_id"))
        self.email = data.get("email")
        self.name = data.get("name")
        self.role = data.get("role", "user")
        self.title = data.get("title", "")
        self.bio = data.get("bio", "")
        self.phone = data.get("phone", "")
        self.location = data.get("location", "")
        self.website = data.get("website", "")
        self.github = data.get("github", "")
        self.linkedin = data.get("linkedin", "")

    @property
    def is_authenticated(self):
        return True

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        try:
            parts = auth_header.split(" ")
            if len(parts) != 2 or parts[0].lower() != "bearer":
                return None
            token = parts[1]
        except Exception:
            return None

        # 1. Try Local JWT Verification First
        try:
            import jwt
            from django.conf import settings
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("sub")
            if email:
                db = get_db()
                user_data = db.users.find_one({"email": email})
                if user_data:
                    return (MongoUser(user_data), token)
        except jwt.PyJWTError:
            # If it fails verification (e.g. signature mismatch), fall back to Firebase
            pass

        # 2. Fallback to Firebase Verification
        try:
            # Verify Firebase ID token
            decoded_token = firebase_auth.verify_id_token(token)
        except Exception as e:
            # Handle clock skew/drift: if token is used too early, sleep 1.5 seconds and retry once
            if "too early" in str(e).lower() or "early" in str(e).lower():
                import time
                time.sleep(1.5)
                try:
                    decoded_token = firebase_auth.verify_id_token(token)
                except Exception as retry_e:
                    raise exceptions.AuthenticationFailed(f"Invalid Firebase token (clock skew): {str(retry_e)}")
            else:
                raise exceptions.AuthenticationFailed(f"Invalid Token (Local JWT verify failed, and Firebase verification failed: {str(e)})")

        email = decoded_token.get("email")
        if not email:
            raise exceptions.AuthenticationFailed("Firebase token payload is missing email")

        db = get_db()
        user_data = db.users.find_one({"email": email})
        
        # Auto-registration: Create MongoDB profile for new OAuth signups
        if not user_data:
            name = decoded_token.get("name", email.split("@")[0])
            new_user = {
                "email": email,
                "name": name,
                "role": "user",
                "title": "",
                "bio": "",
                "phone": "",
                "location": "",
                "website": "",
                "github": "",
                "linkedin": ""
            }
            res = db.users.insert_one(new_user)
            user_data = db.users.find_one({"_id": res.inserted_id})

        return (MongoUser(user_data), token)
