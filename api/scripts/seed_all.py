"""
Ejecuta todos los seeds en el orden correcto.
Uso: python scripts/seed_all.py
"""
import subprocess
import sys
import os

scripts = [
    "init_db.py",
    "seed_admin.py",
    "seed_estados.py",
    "seed_productos.py",
    "seed_demo_data.py"
]

for script in scripts:
    print(f"\nEjecutando {script}...")
    result = subprocess.run([sys.executable, f"scripts/{script}"], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("Error:", result.stderr)
        break
    print("Completado")