from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import base,engine
import models
from auth import router as auth_router
from admin import router as admin_router
from user import router as user_router

base.metadata.create_all(bind=engine)


app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://big-data-athlete-performace-dashboa.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(user_router)

@app.get("/")
def home():
    return "message:hello"