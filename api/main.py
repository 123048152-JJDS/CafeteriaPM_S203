from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.models import user, role, table, product, ingredient, order, sale, expense 
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para el sistema de administración de cafetería CafeteriaPM",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
from app.routers import auth, users, products, orders, sales, stats, ws 

app.include_router(auth.router,     prefix="/auth",      tags=["Auth"])
app.include_router(users.router,    prefix="/usuarios",  tags=["Usuarios"])
app.include_router(products.router, prefix="/productos", tags=["Productos"])
app.include_router(orders.router,   prefix="/pedidos",   tags=["Pedidos"])
app.include_router(sales.router,    prefix="/ventas",    tags=["Ventas"])
app.include_router(stats.router,    prefix="/stats",     tags=["Estadísticas"])
app.include_router(ws.router,       prefix="/ws",        tags=["WebSocket"])


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "ok",
        "docs": "/docs",
    }
