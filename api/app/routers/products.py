from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.product import Category, Product, ProductIngredient
from app.models.ingredient import Ingredient
from app.schemas.product import (
    CategoryOut, CategoryCreate,
    IngredientOut, IngredientCreate, IngredientUpdate,
    ProductOut, ProductDetailOut, ProductCreate, ProductUpdate,
    ProductIngredientOut,
)

router = APIRouter()

@router.get("/categorias", response_model=List[CategoryOut])
def get_categorias(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Category).all()

@router.post("/categorias", response_model=CategoryOut, status_code=201)
def create_categoria(
    data: CategoryCreate,
    db:   Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    if db.query(Category).filter(Category.nombre == data.nombre).first():
        raise HTTPException(400, "La categoría ya existe")
    cat = Category(nombre=data.nombre, tipo=data.tipo)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.get("/ingredientes", response_model=List[IngredientOut])
def get_ingredientes(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Ingredient).order_by(Ingredient.id.asc()).all()

@router.get("/ingredientes/stock-bajo", response_model=List[IngredientOut])
def get_stock_bajo(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Ingredient).filter(
        Ingredient.stock_actual <= Ingredient.stock_minimo
    ).all()

@router.get("/ingredientes/{id}", response_model=IngredientOut)
def get_ingrediente(id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ing = db.query(Ingredient).filter(Ingredient.id == id).first()
    if not ing:
        raise HTTPException(404, "Ingrediente no encontrado")
    return ing

@router.post("/ingredientes", response_model=IngredientOut, status_code=201)
def create_ingrediente(
    data: IngredientCreate,
    db:   Session = Depends(get_db),
    _=Depends(require_roles("admin", "cocina"))
):
    ing = Ingredient(**data.model_dump())
    db.add(ing)
    db.commit()
    db.refresh(ing)
    return ing

@router.patch("/ingredientes/{id}", response_model=IngredientOut)
def update_ingrediente(
    id:   int,
    data: IngredientUpdate,
    db:   Session = Depends(get_db),
    _=Depends(require_roles("admin", "cocina"))
):
    ing = db.query(Ingredient).filter(Ingredient.id == id).first()
    if not ing:
        raise HTTPException(404, "Ingrediente no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(ing, field, value)
    db.commit()
    db.refresh(ing)
    return ing

@router.delete("/ingredientes/{id}", status_code=204)
def delete_ingrediente(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    ing = db.query(Ingredient).filter(Ingredient.id == id).first()
    if not ing:
        raise HTTPException(404, "Ingrediente no encontrado")
    db.delete(ing)
    db.commit()

@router.get("/", response_model=List[ProductOut])
def get_productos(
    disponible: bool | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(Product)
    if disponible is not None:
        q = q.filter(Product.disponible == disponible)
    return q.all()

@router.get("/{id}", response_model=ProductDetailOut)
def get_producto(id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod:
        raise HTTPException(404, "Producto no encontrado")

    ingredientes = []
    for pi in prod.ingredientes:
        ingredientes.append(ProductIngredientOut(
            id_ingrediente=pi.id_ingrediente,
            nombre=pi.ingrediente.nombre,
            unidad=pi.ingrediente.unidad,
            cantidad=float(pi.cantidad),
        ))

    result = ProductDetailOut.model_validate(prod)
    result.ingredientes = ingredientes
    return result

@router.post("/", response_model=ProductOut, status_code=201)
def create_producto(
    data: ProductCreate,
    db:   Session = Depends(get_db),
    _=Depends(require_roles("admin", "cocina"))
):
    prod = Product(
        nombre=data.nombre,
        descripcion=data.descripcion,
        precio=data.precio,
        id_categoria=data.id_categoria,
        disponible=data.disponible,
        imagen_url=data.imagen_url,
    )
    db.add(prod)
    db.flush()  

    for ing_data in data.ingredientes:
        ing = db.query(Ingredient).filter(Ingredient.id == ing_data.id_ingrediente).first()
        if not ing:
            raise HTTPException(400, f"Ingrediente {ing_data.id_ingrediente} no encontrado")
        pi = ProductIngredient(
            id_producto=prod.id,
            id_ingrediente=ing_data.id_ingrediente,
            cantidad=ing_data.cantidad,
        )
        db.add(pi)

    db.commit()
    db.refresh(prod)
    return prod

@router.patch("/{id}", response_model=ProductOut)
def update_producto(
    id:   int,
    data: ProductUpdate,
    db:   Session = Depends(get_db),
    _=Depends(require_roles("admin", "cocina"))
):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(prod, field, value)
    db.commit()
    db.refresh(prod)
    return prod


@router.delete("/{id}", status_code=204)
def delete_producto(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin"))
):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    db.delete(prod)
    db.commit()

@router.patch("/{id}/toggle", response_model=ProductOut)
def toggle_disponible(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "cocina"))
):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod:
        raise HTTPException(404, "Producto no encontrado")
    prod.disponible = not prod.disponible
    db.commit()
    db.refresh(prod)
    return prod

@router.patch("/ingredientes/{id}/ajustar-stock")
def ajustar_stock_ingrediente(
    id: int,
    cantidad: float,
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "cocina"))
):
    ing = db.query(Ingredient).filter(Ingredient.id == id).first()
    if not ing:
        raise HTTPException(404, "Ingrediente no encontrado")
    
    nuevo_stock = float(ing.stock_actual) + cantidad
    if nuevo_stock < 0:
        raise HTTPException(400, "El stock no puede ser negativo")
    
    ing.stock_actual = nuevo_stock
    db.commit()
    db.refresh(ing)
    return {"message": "Stock actualizado", "stock_actual": float(ing.stock_actual)}