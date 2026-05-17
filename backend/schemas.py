from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    email:EmailStr
    username:str
    password: str


class UserResponse(UserBase):
    role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    role: Optional[str] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ForgotPasswordReset(BaseModel):
    email: EmailStr


class ResetPasswordResponse(BaseModel):
    token: str
    new_password: str


class BiometricsCreate(BaseModel):
    sleep_hours: float
    hrv: int


class AdminSearchResponse(BaseModel):
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class DeleteUser(BaseModel):
    email: EmailStr


class AdminCreateUser(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: Optional[str] = "user"


class TokenRequest(BaseModel):
    token: str
    