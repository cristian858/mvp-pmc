"""
Configuración de SafeSign AI
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base"""
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, os.pardir))
    INSTANCE_FOLDER = os.path.join(PROJECT_ROOT, 'instance')
    os.makedirs(INSTANCE_FOLDER, exist_ok=True)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get('DATABASE_URL')
        or 'sqlite:///' + os.path.join(INSTANCE_FOLDER, 'safesign.db').replace('\\', '/')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Rutas de almacenamiento
    UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, 'data', 'uploads')
    CAPTURE_FOLDER = os.path.join(PROJECT_ROOT, 'data', 'capturas')
    SIGNATURE_FOLDER = os.path.join(PROJECT_ROOT, 'data', 'signatures')
    
    # Crear carpetas si no existen
    for folder in [UPLOAD_FOLDER, CAPTURE_FOLDER, SIGNATURE_FOLDER]:
        os.makedirs(folder, exist_ok=True)
    
    # Biometría
    UMBRAL_MOVIMIENTO = float(os.environ.get('UMBRAL_MOVIMIENTO', 0.03))
    
    # IA y análisis
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', None)
    CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY', None)
    USE_MOCK_AI = os.environ.get('USE_MOCK_AI', 'true').lower() == 'true'
    TESSERACT_CMD = os.environ.get('TESSERACT_CMD', None)
    
    # Session
    PERMANENT_SESSION_LIFETIME = 86400  # 24 horas


class DevelopmentConfig(Config):
    """Configuración desarrollo"""
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    """Configuración testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Configuración producción"""
    DEBUG = False
    TESTING = False


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
