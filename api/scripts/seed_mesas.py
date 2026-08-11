"""
Script para crear las mesas del restaurante.
Uso: python scripts/seed_mesas.py

Puedes ajustar la lista MESAS abajo para definir cuántas mesas
y con qué capacidad quieres crear.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.table import Table

# Lista de mesas a crear: (numero, capacidad)
MESAS = [
    (1, 2),
    (2, 2),
    (3, 4),
    (4, 4),
    (5, 4),
    (6, 6),
    (7, 6),
    (8, 8),
    (9, 4),
    (10, 2),
]


def get_or_create_mesa(db, numero, capacidad):
    mesa = db.query(Table).filter(Table.numero == numero).first()
    if mesa:
        print(f"   Mesa {numero} ya existe (capacidad {mesa.capacidad}) — omitida")
        return mesa, False

    mesa = Table(numero=numero, capacidad=capacidad)
    db.add(mesa)
    db.commit()
    db.refresh(mesa)
    print(f"   Mesa {numero} creada (capacidad {capacidad})")
    return mesa, True


def seed_mesas():
    db = SessionLocal()
    try:
        print("Creando mesas...")
        creadas = 0
        for numero, capacidad in MESAS:
            _, fue_creada = get_or_create_mesa(db, numero, capacidad)
            if fue_creada:
                creadas += 1

        total = db.query(Table).count()
        print(f"\n{creadas} mesas nuevas creadas.")
        print(f"Total de mesas en la base de datos: {total}")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_mesas()