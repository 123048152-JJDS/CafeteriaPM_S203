from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_roles, hash_password
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserUpdate, UserOut, RoleOut

router = APIRouter()


# ══════════════════════════════════════════════════════════════
#  ROLES
# ══════════════════════════════════════════════════════════════

@router.get("/roles", response_model=List[RoleOut])
def get_roles(
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    """Lista todos los roles disponibles."""
    return db.query(Role).all()


# ══════════════════════════════════════════════════════════════
#  USUARIOS
# ══════════════════════════════════════════════════════════════

@router.get("/", response_model=List[UserOut])
def get_users(
    db:  Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    """Lista todos los usuarios. Solo admin."""
    return db.query(User).all()


@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    """Devuelve el usuario autenticado actual."""
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
    """Crea un nuevo usuario. Solo admin."""
    # Verificar email duplicado
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Verificar que el rol existe
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
    data:    UserUpdate,
    db:      Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    """Actualiza parcialmente un usuario. Solo admin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.nombre   is not None: user.nombre        = data.nombre
    if data.email    is not None:
        if db.query(User).filter(User.email == data.email, User.id != user_id).first():
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        user.email = data.email
    if data.password is not None: user.password_hash = hash_password(data.password)
    if data.id_rol   is not None:
        if not db.query(Role).filter(Role.id == data.id_rol).first():
            raise HTTPException(status_code=400, detail="Rol no encontrado")
        user.id_rol = data.id_rol
    if data.activo   is not None: user.activo        = data.activo

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id:      int,
    db:           Session = Depends(get_db),
    current_user=Depends(require_roles("admin"))
):
    """Elimina un usuario. Solo admin. No puede eliminarse a sí mismo."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")

    db.delete(user)
    db.commit()
