from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from schemas import ProductCreate,ProductUpdate,ProductRead
from database import get_db
from models import Products
from auth import verify_token
from fastapi import Header
router=APIRouter(prefix="/crud",tags=["crud_operations"])

@router.post("/create")
def create(product:ProductCreate,authorization:str=Header(None),db:Session=Depends(get_db)):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]

    user=verify_token(token)

    if user["role"]!="admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="admin acess required")
    p=Products(**product.dict())

    db.add(p)
    db.commit()
    db.refresh(p)

    return p

@router.get("/read")
def read(product:ProductRead=Depends(),authorization:str=Header(None),db:Session=Depends(get_db)):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token=authorization.split(" ")[1]
    user=verify_token(token)

    if user["role"]!="admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Admin access required")
    
    p=db.query(Products).filter(Products.id==product.id).first()

    return p



@router.put("/update")
def update(product:ProductUpdate,authorization:str=Header(None),db:Session=Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token=authorization.split(" ")[1]
    user=verify_token(token)

    if user["role"]!="admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Admin access required")
    
    p=db.query(Products).filter(Products.id==product.id).first()

    if not p :
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="product not found")
    
    if product.name is not None:
        p.name=product.name
    if product.quantity is not None:
        p.quantity=product.quantity
    if product.price is not None:
        p.price=product.price

    db.commit()
    db.refresh(p)
    return {"message":"updated successfully","product":p}


@router.delete("/delete")
def delete(product:ProductRead=Depends(),authorization:str=Header(None),db:Session=Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token=authorization.split(" ")[1]
    user=verify_token(token)

    if user["role"]!="admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="admin access required")
    
    p=db.query(Products).filter(Products.id==product.id).first()

    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="product not found")
    
    db.delete(p)
    db.commit()

    return {"message": "Product deleted successfully"}
