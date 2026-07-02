"""
Script para insertar estados de pedido, métodos de pago y tablas base.
Uso: python scripts/seed_estados.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.role import Role
from app.models.order import OrderStatus
from app.models.sale import PaymentMethod


def seed_estados(db):
    # Obtener roles
    roles = {r.nombre: r.id for r in db.query(Role).all()}
    if len(roles) < 4:
        print("⚠️  Ejecuta primero seed_admin.py para crear los roles")
        return

    estados = [
        ("pendiente",        "Pedido creado, esperando preparación",      "mesero"),
        ("en_preparacion",   "Pedido siendo preparado en cocina",        "cocina"),
        ("listo",            "Pedido listo para entregar",               "cocina"),
        ("entregado",        "Pedido entregado al cliente",              "mesero"),
        ("pagado",           "Pedido pagado (cerrado)",                  "caja"),
        ("cancelado",        "Pedido cancelado",                         "caja"),
    ]

    for nombre, desc, rol_nombre in estados:
        if not db.query(OrderStatus).filter(OrderStatus.nombre == nombre).first():
            status = OrderStatus(
                nombre=nombre,
                descripcion=desc,
                id_rol=roles.get(rol_nombre)
            )
            db.add(status)
    db.commit()
    print("✓ Estados de pedido creados/verificados")


def seed_metodos_pago(db):
    metodos = [
        ("efectivo",       "Pago en efectivo"),
        ("tarjeta",        "Pago con tarjeta de crédito/débito"),
        ("transferencia",  "Pago por transferencia bancaria"),
        ("otro",           "Otro método de pago"),
    ]
    for nombre, desc in metodos:
        if not db.query(PaymentMethod).filter(PaymentMethod.nombre == nombre).first():
            db.add(PaymentMethod(nombre=nombre, descripcion=desc))
    db.commit()
    print("✓ Métodos de pago creados/verificados")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_estados(db)
        seed_metodos_pago(db)
        print("\n✅ Seed de estados y métodos de pago completado.")
    finally:
        db.close()