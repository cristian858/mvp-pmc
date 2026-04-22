"""
Modelos de base de datos con SQLAlchemy
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db, login_manager


class User(UserMixin, db.Model):
    """Modelo de usuario"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    documents = db.relationship('Document', backref='user', lazy=True, cascade='all, delete-orphan')
    signatures = db.relationship('Signature', backref='user', lazy=True, cascade='all, delete-orphan')
    biometric_verifications = db.relationship('BiometricVerification', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hashear y guardar contraseña"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verificar contraseña"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email}>'


class Document(db.Model):
    """Modelo de documento"""
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(500), nullable=False)
    contenido_texto = db.Column(db.Text, nullable=True)
    resumen_ia = db.Column(db.Text, nullable=True)
    riesgos = db.Column(db.Text, nullable=True)
    obligaciones = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='pendiente')  # pendiente, firmado, rechazado
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    signatures = db.relationship('Signature', backref='document', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Document {self.filename}>'


class Signature(db.Model):
    """Modelo de firma digital"""
    __tablename__ = 'signatures'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False, index=True)
    firma_imagen = db.Column(db.String(500), nullable=True)  # ruta a la imagen PNG
    firma_video = db.Column(db.String(500), nullable=True)   # ruta al video WebM
    fecha_firma = db.Column(db.DateTime, default=datetime.utcnow)
    resultado_verificacion = db.Column(db.String(50), nullable=True)  # VERDE, AMARILLO, ROJO
    notas = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<Signature user={self.user_id} doc={self.document_id}>'


class BiometricVerification(db.Model):
    """Modelo de verificación biométrica"""
    __tablename__ = 'biometric_verifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    foto_referencia = db.Column(db.String(500), nullable=True)  # foto del documento de identidad
    foto_neutral = db.Column(db.String(500), nullable=True)     # foto neutra para comparación
    documento_texto = db.Column(db.Text, nullable=True)
    documento_nombre_detectado = db.Column(db.String(255), nullable=True)
    documento_nombre_match = db.Column(db.Boolean, default=False)
    documento_ocr_estado = db.Column(db.String(50), nullable=True)
    documento_ocr_error = db.Column(db.Text, nullable=True)
    estado = db.Column(db.String(50), default='pendiente')       # pendiente, verificado, rechazado
    semaforo = db.Column(db.String(20), nullable=True)           # VERDE, AMARILLO, ROJO
    movimiento_score = db.Column(db.Float, nullable=True)
    distancia_facial = db.Column(db.Float, nullable=True)
    intentos = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<BiometricVerification user={self.user_id} semaforo={self.semaforo}>'


@login_manager.user_loader
def load_user(user_id):
    """Cargar usuario desde sesión"""
    return User.query.get(int(user_id))
