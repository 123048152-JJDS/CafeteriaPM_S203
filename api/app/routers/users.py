from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_roles, hash_password
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserUpdate, UserOut, RoleOut

router = APIRouter()

@router.get("/roles", response_model=List[RoleOut])
def get_roles(
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    return db.query(Role).all()

@router.get("/", response_model=List[UserOut])
def get_users(
    search: Optional[str] = None,
    rol_id: Optional[int] = None,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    q = db.query(User)
    
    if search:
        q = q.filter(
            (User.nombre.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )
    if rol_id:
        q = q.filter(User.id_rol == rol_id)
    if activo is not None:
        q = q.filter(User.activo == activo)
    
    return q.all()

@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db:      Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db:   Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    role = db.query(Role).filter(Role.id == data.id_rol).first()
    if not role:
        raise HTTPException(status_code=400, detail="Rol no encontrado")

    user = User(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password),
        id_rol=data.id_rol,
        activo=data.activo,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.nombre is not None:
        user.nombre = data.nombre
    if data.email is not None:
        if db.query(User).filter(User.email == data.email, User.id != user_id).first():
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        user.email = data.email
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    if data.id_rol is not None:
        if not db.query(Role).filter(Role.id == data.id_rol).first():
            raise HTTPException(status_code=400, detail="Rol no encontrado")
        user.id_rol = data.id_rol
    if data.activo is not None:
        user.activo = data.activo

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id:      int,
    db:           Session = Depends(get_db),
    current_user=Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")

    db.delete(user)
    db.commit()