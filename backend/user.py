from fastapi import APIRouter, Depends, HTTPException,status
import csv
import io
from fastapi import Header,UploadFile,File
from sqlalchemy.orm import Session
from database import get_db
from schemas import BiometricsCreate
from models import Biometrics
from auth import verify_token
from datetime import datetime 
from sqlalchemy import func

router=APIRouter(prefix="/user",tags=["user"])

@router.post("/biometrics")
def biometrics(bio:BiometricsCreate,authorization:str=Header(None),db:Session=Depends(get_db)):
     
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]

    user=verify_token(token)

    if user["role"]!="user":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="user acess required")
    
    user_email=user.get("email")
    
    new_bio=Biometrics(user_email=user_email,sleep_hours=bio.sleep_hours,hrv=bio.hrv)
    
    db.add(new_bio)
    db.commit()
    db.refresh(new_bio)

    return new_bio


@router.post("/biometrics/upload")
async def biometrics_upload(file: UploadFile = File(...),authorization:str=Header(None),db:Session=Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]

    user=verify_token(token)

    if user["role"]!="user":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="user acess required")
    
    user_email=user.get("email")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400,detail="Only csv files are allowed")
    
    content = await file.read()
    decoded = content.decode("utf-8")

    reader = csv.DictReader(io.StringIO(decoded))

    records = []
    for row in reader:
        try:
            record = Biometrics(
                user_email=user_email,
                sleep_hours=float(row["sleep_hours"]),
                hrv=int(row["hrv"]),
                recorded_at=datetime.utcnow()
            )
            records.append(record)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid CSV format or data type"
            )

    if not records:
        raise HTTPException(status_code=400, detail="CSV is empty")

    db.add_all(records)
    db.commit()

    return {
        "message": "Biometrics CSV ingested successfully",
        "rows_inserted": len(records)
    }



@router.get("/get_biometrics")
def get_biometrics(authorization:str=Header(None),db:Session=Depends(get_db)):
     
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]

    user=verify_token(token)

    if user["role"]!="user":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="user acess required")
    
    user_email=user.get("email")

    summary = db.query(
        func.avg(Biometrics.sleep_hours).label("avg_sleep"),
        func.avg(Biometrics.hrv).label("avg_hrv"),
        func.max(Biometrics.sleep_hours).label("max_sleep"),
        func.min(Biometrics.sleep_hours).label("min_sleep"),
    ).filter(Biometrics.user_email == user_email).first()

    return {
        "avg_sleep": float(summary.avg_sleep) if summary.avg_sleep else 0,
        "avg_hrv": float(summary.avg_hrv) if summary.avg_hrv else 0,
        "max_sleep": float(summary.max_sleep) if summary.max_sleep else 0,
        "min_sleep": float(summary.min_sleep) if summary.min_sleep else 0
    }
