"""
Script para crear roles base y el primer usuario administrador.
Uso: python scripts/seed_admin.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User

def seed_roles(db):
    roles_data = [
        ("admin",  "Acceso total, panel web y estadísticas"),
        ("cocina", "Cola de pedidos, menú e inventario"),
        ("caja",   "Cobro, ventas y gastos"),
        ("mesero", "Levantamiento y entrega de pedidos"),
    ]
    for nombre, desc in roles_data:
        if not db.query(Role).filter(Role.nombre == nombre).first():
            db.add(Role(nombre=nombre, descripcion=desc))
    db.commit()
    print("Roles creados/verificados")


def seed_admin(db):
    email = "admin@cafe.com"
    if db.query(User).filter(User.email == email).first():
        print(f"El usuario {email} ya existe")
        return

    admin_role = db.query(Role).filter(Role.nombre == "admin").first()
    user = User(
        nombre="Admin",
        email=email,
        password_hash=hash_password("Admin123!"),
        id_rol=admin_role.id,
        activo=True,
    )
    db.add(user)
    db.commit()
    print(f"Usuario admin creado: {email} / Admin123!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_roles(db)
        seed_admin(db)
        print("\nSeed completado. Ya puedes hacer login.")
    finally:
        db.close()
