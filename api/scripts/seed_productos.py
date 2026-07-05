"""
Seed de categorías, ingredientes y productos del menú.
Uso: python scripts/seed_productos.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.product import Category, Product, ProductIngredient
from app.models.ingredient import Ingredient

def seed(db):
    cats = [
        ("Bebidas",       "producto"),
        ("Comida",        "producto"),
        ("Postres",       "producto"),
        ("Suministros",   "gasto"),
        ("Servicios",     "gasto"),
    ]
    cat_map = {}
    for nombre, tipo in cats:
        c = db.query(Category).filter(Category.nombre == nombre).first()
        if not c:
            c = Category(nombre=nombre, tipo=tipo)
            db.add(c)
            db.flush()
        cat_map[nombre] = c
    db.commit()
    print(f"{len(cats)} categorías")

    ings_data = [
        ("Café molido",    "kg",    2.4,  0.5,  180.0),
        ("Leche entera",   "L",     0.8,  2.0,   22.0),
        ("Harina",         "kg",    0.3,  1.0,   18.0),
        ("Azúcar",         "kg",    1.8,  0.5,   24.0),
        ("Pan de caja",    "pzas", 24.0, 10.0,    2.5),
        ("Pechuga pollo",  "kg",    1.2,  0.5,   95.0),
        ("Queso amarillo", "kg",    0.6,  0.2,  120.0),
        ("Jamón",          "kg",    0.4,  0.2,  110.0),
        ("Crema",          "L",     0.5,  0.2,   35.0),
    ]
    ing_map = {}
    for nombre, unidad, stock_a, stock_m, costo in ings_data:
        i = db.query(Ingredient).filter(Ingredient.nombre == nombre).first()
        if not i:
            i = Ingredient(
                nombre=nombre, unidad=unidad,
                stock_actual=stock_a, stock_minimo=stock_m,
                costo_unitario=costo
            )
            db.add(i)
            db.flush()
        ing_map[nombre] = i
    db.commit()
    print(f"{len(ings_data)} ingredientes")

    productos = [
        {
            "nombre": "Café Americano", "precio": 35.0,
            "categoria": "Bebidas", "descripcion": "Espresso con agua caliente",
            "ingredientes": [("Café molido", 0.018)]
        },
        {
            "nombre": "Latte", "precio": 55.0,
            "categoria": "Bebidas", "descripcion": "Espresso con leche vaporizada",
            "ingredientes": [("Café molido", 0.018), ("Leche entera", 0.150)]
        },
        {
            "nombre": "Capuchino", "precio": 65.0,
            "categoria": "Bebidas", "descripcion": "Espresso con leche espumada",
            "ingredientes": [("Café molido", 0.018), ("Leche entera", 0.100)]
        },
        {
            "nombre": "Sandwich Club", "precio": 85.0,
            "categoria": "Comida", "descripcion": "Pollo, jamón, queso y verduras",
            "ingredientes": [
                ("Pan de caja", 2.0), ("Pechuga pollo", 0.1),
                ("Queso amarillo", 0.05), ("Jamón", 0.05)
            ]
        },
        {
            "nombre": "Pan tostado", "precio": 30.0,
            "categoria": "Comida", "descripcion": "Pan de caja con mantequilla",
            "ingredientes": [("Pan de caja", 2.0)]
        },
        {
            "nombre": "Pay de queso", "precio": 45.0,
            "categoria": "Postres", "descripcion": "Rebanada de pay de queso crema",
            "disponible": False,
            "ingredientes": [("Harina", 0.05), ("Crema", 0.03)]
        },
    ]

    for p_data in productos:
        if db.query(Product).filter(Product.nombre == p_data["nombre"]).first():
            continue
        prod = Product(
            nombre=p_data["nombre"],
            descripcion=p_data.get("descripcion"),
            precio=p_data["precio"],
            id_categoria=cat_map[p_data["categoria"]].id,
            disponible=p_data.get("disponible", True),
        )
        db.add(prod)
        db.flush()
        for ing_nombre, cantidad in p_data["ingredientes"]:
            db.add(ProductIngredient(
                id_producto=prod.id,
                id_ingrediente=ing_map[ing_nombre].id,
                cantidad=cantidad,
            ))
    db.commit()
    print(f"{len(productos)} productos con ingredientes")
    print("\nSeed de productos completado.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
