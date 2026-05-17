from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, Float
from database import base
from datetime import datetime


class Users(base):
    __tablename__ = "users"

    email = Column(String(100), primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    verification_token = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)


class PasswordReset(base):
    __tablename__ = "passwordreset"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    token_hash = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)


class Biometrics(base):
    __tablename__ = "biometrics"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    sleep_hours = Column(Float, nullable=False)
    hrv = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class Activities(base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    intensity_score = Column(Integer, nullable=False)
    activity_date = Column(DateTime, default=datetime.utcnow)