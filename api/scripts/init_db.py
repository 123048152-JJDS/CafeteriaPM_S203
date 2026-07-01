import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine
from sqlalchemy import text

def run_sql_script(script_path):
    with engine.connect() as conn:
        with open(script_path, 'r', encoding='utf-8') as f:
            sql = f.read()
        conn.execute(text(sql))
        conn.commit()
        print("Script SQL ejecutado exitosamente.")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    script_path = os.path.join(base_dir, "sql", "CafeteriaPM_S203.sql")
    
    if not os.path.exists(script_path):
        print(f"No se encontró el archivo: {script_path}")
        sys.exit(1)
    
    print("Inicializando base de datos...")
    run_sql_script(script_path)
    print("Base de datos lista para usar.")