"""
SafeSign AI - Aplicación Flask
"""
from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from sqlalchemy import inspect, text

db = SQLAlchemy()
login_manager = LoginManager()


def ensure_schema(app):
    """Additive SQLite schema updates for local MVP development."""
    if app.config.get('TESTING'):
        return

    engine = db.engine
    inspector = inspect(engine)
    if 'biometric_verifications' not in inspector.get_table_names():
        return

    existing = {column['name'] for column in inspector.get_columns('biometric_verifications')}
    required = {
        'documento_texto': 'TEXT',
        'documento_nombre_detectado': 'VARCHAR(255)',
        'documento_nombre_match': 'BOOLEAN DEFAULT 0',
        'documento_ocr_estado': 'VARCHAR(50)',
        'documento_ocr_error': 'TEXT',
    }

    with engine.begin() as connection:
        for column_name, column_type in required.items():
            if column_name not in existing:
                connection.execute(
                    text(f'ALTER TABLE biometric_verifications ADD COLUMN {column_name} {column_type}')
                )


def create_app(config_name='development'):
    """Factory para crear la app Flask"""
    app = Flask(__name__)
    
    # Cargar configuración
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Configurar CORS
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    frontend_url = os.environ.get('FRONTEND_URL', '').strip()
    if frontend_url:
        allowed_origins.append(frontend_url)

    cors_config = {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
    
    CORS(app, resources={r"/api/*": cors_config})
    
    # Inicializar extensiones
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Por favor inicia sesión para acceder.'
    
    # Importar modelos antes de crear tablas para que SQLAlchemy registre
    # toda la metadata de la base de datos.
    from app.models import database  # noqa: F401

    # Crear tablas
    with app.app_context():
        db.create_all()
        ensure_schema(app)
    
    # Registrar blueprints
    from app.routes.auth import bp as auth_bp
    from app.routes.documents import bp as documents_bp
    from app.routes.biometry import bp as biometry_bp
    from app.routes.signature import bp as signature_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(biometry_bp)
    app.register_blueprint(signature_bp)
    
    # Registrar blueprints de API REST
    from app.api.auth import bp as api_auth_bp
    from app.api.documents import bp as api_documents_bp
    from app.api.biometry import bp as api_biometry_bp
    from app.api.signature import bp as api_signature_bp
    
    app.register_blueprint(api_auth_bp)
    app.register_blueprint(api_documents_bp)
    app.register_blueprint(api_biometry_bp)
    app.register_blueprint(api_signature_bp)
    
    # Ruta de inicio
    @app.route('/')
    def index():
        from flask import redirect
        from flask_login import current_user
        if current_user.is_authenticated:
            return redirect('/dashboard')
        return redirect('/login')
    
    return app
