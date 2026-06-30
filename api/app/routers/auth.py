from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # 1. Buscar usuario por email
    user = db.query(User).filter(
        User.email == data.email,
        User.activo == True
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    # 2. Verificar contraseña
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    # 3. Generar token JWT con id y rol
    token = create_access_token(data={
        "sub": str(user.id),
        "rol": user.role.nombre
    })

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        nombre=user.nombre,
        rol=user.role.nombre
    )
