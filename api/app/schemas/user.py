from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RoleOut(BaseModel):
    id:          int
    nombre:      str
    descripcion: Optional[str] = None

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    nombre:   str
    email:    EmailStr
    password: str
    id_rol:   int
    activo:   bool = True


class UserUpdate(BaseModel):
    nombre:   Optional[str]      = None
    email:    Optional[EmailStr] = None
    password: Optional[str]      = None
    id_rol:   Optional[int]      = None
    activo:   Optional[bool]     = None


class UserOut(BaseModel):
    id:         int
    nombre:     str
    email:      str
    activo:     bool
    created_at: datetime
    role:       RoleOut

    model_config = {"from_attributes": True}
