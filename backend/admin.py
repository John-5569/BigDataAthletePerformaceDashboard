from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Users, Biometrics
from schemas import UserOut, UserUpdate, AdminSearchResponse, DeleteUser, AdminCreateUser

from auth import hash_password
from auth import admin_required
from sqlalchemy import or_, func

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=List[UserOut])
def get_all_users(
    admin=Depends(admin_required),
    db: Session = Depends(get_db)
):
    return db.query(Users).all()


@router.put("/manage")
def manage(
    user: UserUpdate,
    admin=Depends(admin_required),
    db: Session = Depends(get_db)
):
    u = db.query(Users).filter(Users.email == user.email).first()

    if not u:
        raise HTTPException(404, "User not found")

    if user.username is not None:
        u.username = user.username

    if user.role is not None:
        u.role = user.role

    db.commit()
    db.refresh(u)

    return {"message": "User updated"}


@router.get("/search", response_model=List[AdminSearchResponse])
def search(
    text: str = Query(...),
    admin=Depends(admin_required),
    db: Session = Depends(get_db)
):
    users = db.query(Users).filter(
        or_(
            Users.username.ilike(f"%{text}%"),
            Users.email.ilike(f"%{text}%")
        )
    ).all()

    return users


@router.get("/user-performance/{email}")
def get_user_performance(
    email: str,
    admin=Depends(admin_required),
    db: Session = Depends(get_db)
):
    summary = db.query(
        func.avg(Biometrics.sleep_hours),
        func.avg(Biometrics.hrv),
        func.max(Biometrics.sleep_hours),
        func.min(Biometrics.sleep_hours)
    ).filter(Biometrics.user_email == email).first()

    return {
        "avg_sleep": float(summary[0] or 0),
        "avg_hrv": float(summary[1] or 0),
        "max_sleep": float(summary[2] or 0),
        "min_sleep": float(summary[3] or 0),
    }


@router.delete("/delete")
def delete_user(
    user_data: DeleteUser,
    admin=Depends(admin_required),
    db: Session = Depends(get_db)
):
    u = db.query(Users).filter(Users.email == user_data.email).first()

    if not u:
        raise HTTPException(404, "User not found")

    db.delete(u)
    db.commit()

    return {"message": "Deleted"}


@router.post("/create-user", response_model=UserOut)
def admin_create_user(
    data: AdminCreateUser,
    admin=Depends(admin_required),
    db: Session = Depends(get_db)
):
    existing = db.query(Users).filter(Users.email == data.email).first()
    if existing:
        raise HTTPException(400, "A user with this email already exists")

    hashed = hash_password(data.password)   
    new_user = Users(
        email=data.email,
        username=data.username,
        hashed_password=hashed,
        role=data.role,
        is_verified=True,          
        verification_token=None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user