#!/usr/bin/env python3
"""
Script para verificar que SafeSign AI está funcionando correctamente en Docker
"""

import subprocess
import sys
import json
import time

def run_command(cmd, check=True):
    """Ejecutar comando y retornar output"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"ERROR: Error ejecutando: {cmd}")
        print(f"   {result.stderr}")
        return None
    return result.stdout.strip()

def check_docker_running():
    """Verificar si Docker está corriendo"""
    output = run_command("docker ps -q -f name=safesign-backend", check=False)
    return bool(output)

def check_dependencies():
    """Verificar dependencias en el contenedor"""
    print("\nVerificando dependencias...")
    
    cmd = """
docker-compose exec -T safesign-backend python3 -c "
import sys
deps = {
    'Flask': 'flask',
    'Flask-Login': 'flask_login',
    'SQLAlchemy': 'sqlalchemy',
    'OpenCV': 'cv2',
    'NumPy': 'numpy',
    'Pandas': 'pandas',
    'Pytesseract': 'pytesseract',
    'PyPDF2': 'PyPDF2',
    'Pillow': 'PIL',
}

missing = []
for name, module in deps.items():
    try:
        __import__(module)
        print(f'  OK {name}')
    except ImportError:
        print(f'  ERROR {name}')
        missing.append(name)

sys.exit(len(missing))
"
"""
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    
    if result.returncode != 0:
        print(f"\nAVISO: Algunas dependencias no están disponibles")
        return False
    
    return True

def check_database():
    """Verificar que la BD se creó correctamente"""
    print("\nVerificando base de datos...")
    
    # Verificar que existen las tablas
    cmd = """
docker-compose exec -T safesign-backend python3 -c "
from app import create_app, db
from app.models.database import User, Document, Signature, BiometricVerification

app = create_app()
with app.app_context():
    # Verificar que las tablas existen
    tables = db.metadata.tables.keys()
    expected = ['users', 'documents', 'signatures', 'biometric_verifications']
    
    for table in expected:
        if table in tables:
            print(f'  OK Tabla {table}')
        else:
            print(f'  ERROR Tabla {table} NO ENCONTRADA')
"
"""
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    
    if result.returncode != 0:
        print(f"ERROR: Error verificando BD:")
        print(result.stderr)
        return False
    
    return True

def main():
    print("=" * 60)
    print("SafeSign AI - Docker Verification Script")
    print("=" * 60)
    
    # Check if Docker is running
    print("\nVerificando Docker...")
    if not check_docker_running():
        print("ERROR: Contenedor no está corriendo")
        print("   Ejecuta: docker-compose up -d")
        sys.exit(1)
    
    print("OK: Contenedor está corriendo")
    
    # Check dependencies
    if not check_dependencies():
        print("ERROR: Algunas dependencias faltaron")
        sys.exit(1)
    
    # Check database
    if not check_database():
        print("ERROR: BD tiene problemas")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("OK: SafeSign AI está listo!")
    print("=" * 60)
    print("\nAccede a: http://localhost:8080")
    print("\nDocumentación: DOCKER_GUIDE.md")

if __name__ == '__main__':
    main()
