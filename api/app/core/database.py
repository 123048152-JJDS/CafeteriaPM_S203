from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from decouple import UndefinedValueError
from app.core.config import get_db_config


def build_database_url() -> str:
    try:
        cfg = get_db_config()
        return (
            f"postgresql://{cfg['user']}:{cfg['password']}"
            f"@{cfg['host']}:{cfg['port']}/{cfg['db']}"
        )
    except UndefinedValueError as e:
        print(f"[ERROR] Falta variable de entorno para la BD: {e}")
        raise SystemExit(1)


DATABASE_URL = build_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[DB] Conexión a PostgreSQL exitosa ✓")
    except Exception as e:
        print(f"[DB] Error al conectar con PostgreSQL: {e}")
        raise SystemExit(1)


if __name__ == "__main__":
    verify_connection()
