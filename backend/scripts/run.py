"""
SafeSign AI - Punto de entrada
"""
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
sys.path.insert(0, PROJECT_ROOT)

from app import create_app, db
from app.models.database import User, Document, Signature, BiometricVerification

# Crear app
app = create_app(os.environ.get('FLASK_ENV', 'development'))


@app.shell_context_processor
def make_shell_context():
    """Contexto para flask shell"""
    return {
        'db': db,
        'User': User,
        'Document': Document,
        'Signature': Signature,
        'BiometricVerification': BiometricVerification
    }


if __name__ == '__main__':
    # Crear tablas si no existen
    with app.app_context():
        db.create_all()
    
    # Leer puerto de variables de entorno
    port = int(os.environ.get('FLASK_PORT', 8080))
    
    # Ejecutar servidor
    app.run(
        debug=os.environ.get('FLASK_ENV') == 'development',
        host='0.0.0.0',
        port=port
    )
