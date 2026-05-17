from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from jose import jwt, JWTError
from passlib.context import CryptContext
from database import get_db
from models import Users, PasswordReset
from schemas import UserCreate, UserLogin,ForgotPasswordReset,ResetPasswordResponse,TokenRequest
import secrets
import hashlib
import redis
import os
from dotenv import load_dotenv
from email_send import send_reset_email,send_verification_email
from google.oauth2 import id_token
from google.auth.transport import requests  

load_dotenv()


router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# ✅ ENV VALIDATION
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
BASE_URL = os.getenv("BASE_URL")
CLIENT_ID = os.getenv("CLIENT_ID")


if not SECRET_KEY:
    raise Exception("SECRET_KEY missing in .env")

# Redis
r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("REDIS_DB")),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True
)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ================= TOKEN FUNCTIONS =================

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")

        if not email:
            raise HTTPException(401, "Invalid token")

        return {"email": email, "role": role}

    except JWTError:
        raise HTTPException(401, "Invalid or expired token")


def create_access_token(data: dict):
    data = data.copy()
    data["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict):
    data = data.copy()
    data["exp"] = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def generate_token():
    return secrets.token_urlsafe(32)


# ================= AUTH HELPERS =================

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    if r.get(f"blacklist:{token}"):
        raise HTTPException(401, "Token revoked")

    return verify_token(token)


def admin_required(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin access required")
    return user


# ================= PASSWORD =================

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


# ================= REGISTER =================

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(Users).filter(Users.email == user.email).first()

    if existing:
        raise HTTPException(400, "Email already exists")

    token = generate_token()

    new_user = Users(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        verification_token=token,

    )

    db.add(new_user)
    db.commit()

    send_verification_email(user.email, f"{BASE_URL}/verify?token={token}")

    return {"message": "User created. Verify email."}


@router.post("/google/signup")
def googleSignup(data: TokenRequest, db: Session = Depends(get_db)):
    """Google Sign-Up: creates a new account. Returns tokens on success."""
    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    username = idinfo.get("name") or email.split("@")[0]

    existing = db.query(Users).filter(Users.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already has an account. Please sign in instead.")

    # Placeholder password — Google users don't use it, but forgot-password still works
    placeholder_pw = hash_password(email + SECRET_KEY)

    new_user = Users(
        email=email,
        username=username,
        hashed_password=placeholder_pw,
        verification_token=None,
        is_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "access_token": create_access_token({"sub": new_user.email, "role": new_user.role}),
        "refresh_token": create_refresh_token({"sub": new_user.email, "role": new_user.role}),
    }


@router.post("/google/login")
def googleLoginEndpoint(data: TokenRequest, db: Session = Depends(get_db)):
    """Google Sign-In: logs in an existing user. Returns no_account error if they don't exist."""
    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")

    existing = db.query(Users).filter(Users.email == email).first()
    if not existing:
        # 404 with detail="no_account" — frontend uses this code to show friendly popup
        raise HTTPException(status_code=404, detail="no_account")

    return {
        "access_token": create_access_token({"sub": existing.email, "role": existing.role}),
        "refresh_token": create_refresh_token({"sub": existing.email, "role": existing.role}),
    }


# ================= VERIFY =================

@router.get("/verify")
def verify(token: str, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.verification_token == token).first()

    if not user:
        raise HTTPException(400, "Invalid token")

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Verified"}


# ================= LOGIN =================

@router.post("/login")
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    key = f"rate_limit:login:{user.email}:{ip}"

    if int(r.get(key) or 0) >= 5:
        raise HTTPException(429, "Too many attempts")

    existing = db.query(Users).filter(Users.email == user.email).first()

    if not existing:
        raise HTTPException(401, "Invalid credentials")

    if not verify_password(user.password, existing.hashed_password):
        count = r.incr(key)
        if count == 1:
            r.expire(key, 900)
        raise HTTPException(401, "Invalid credentials")

    if not existing.is_verified:
        raise HTTPException(403, "Verify email first")

    r.delete(key)

    return {
        "access_token": create_access_token({"sub": existing.email, "role": existing.role}),
        "refresh_token": create_refresh_token({"sub": existing.email, "role": existing.role})
    }


# ================= LOGOUT =================

@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    r.set(f"blacklist:{token}", "true", ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    return {"message": "Logged out"}


# ================= FORGOT =================

@router.post("/forgot")
def forgot(data: ForgotPasswordReset, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.email == data.email).first()

    if not user:
        return {"message": "If exists, email sent"}

    db.query(PasswordReset).filter(
        PasswordReset.user_email == data.email
    ).update({"used": True})

    token = generate_token()
    hashed = hashlib.sha256(token.encode()).hexdigest()

    db.add(PasswordReset(
        user_email=data.email,
        token_hash=hashed,
        expires_at=datetime.utcnow() + timedelta(minutes=15)
    ))
    db.commit()

    send_reset_email(data.email, f"{BASE_URL}/resetpassword?token={token}")

    return {"message": "Reset link sent"}


# ================= RESET =================

@router.post("/reset")
def reset(data: ResetPasswordResponse, db: Session = Depends(get_db)):
    hashed = hashlib.sha256(data.token.encode()).hexdigest()

    entry = db.query(PasswordReset).filter(
        PasswordReset.token_hash == hashed,
        PasswordReset.used == False,
        PasswordReset.expires_at > datetime.utcnow()
    ).first()

    if not entry:
        raise HTTPException(400, "Invalid or expired")

    user = db.query(Users).filter(Users.email == entry.user_email).first()

    user.hashed_password = hash_password(data.new_password)
    entry.used = True

    db.commit()

    return {"message": "Password reset successful"}