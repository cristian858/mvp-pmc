"""
Servicio de autenticación
"""
from app.models.database import User
from app import db


class AuthService:
    """Servicio de autenticación"""
    
    @staticmethod
    def register_user(name, email, password, password_confirm):
        """
        Registra un nuevo usuario
        
        Args:
            name (str): Nombre del usuario
            email (str): Email único
            password (str): Contraseña
            password_confirm (str): Confirmación de contraseña
        
        Returns:
            dict: {'success': bool, 'user': User, 'error': str}
        """
        # Validaciones
        if not name or len(name) < 2:
            return {'success': False, 'user': None, 'error': 'Nombre inválido'}
        
        if not email or '@' not in email:
            return {'success': False, 'user': None, 'error': 'Email inválido'}
        
        if password != password_confirm:
            return {'success': False, 'user': None, 'error': 'Contraseñas no coinciden'}
        
        if len(password) < 8:
            return {'success': False, 'user': None, 'error': 'Contraseña muy corta (mínimo 8 caracteres)'}
        
        # Verificar email único
        if User.query.filter_by(email=email).first():
            return {'success': False, 'user': None, 'error': 'Email ya registrado'}
        
        try:
            # Crear usuario
            user = User(name=name, email=email)
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            return {'success': True, 'user': user, 'error': None}
        
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'user': None, 'error': f'Error registrando usuario: {str(e)}'}
    
    @staticmethod
    def login_user(email, password):
        """
        Valida credenciales de login
        
        Args:
            email (str): Email del usuario
            password (str): Contraseña
        
        Returns:
            dict: {'success': bool, 'user': User, 'error': str}
        """
        try:
            user = User.query.filter_by(email=email).first()
            
            if not user:
                return {'success': False, 'user': None, 'error': 'Email o contraseña incorrectos'}
            
            if not user.check_password(password):
                return {'success': False, 'user': None, 'error': 'Email o contraseña incorrectos'}
            
            return {'success': True, 'user': user, 'error': None}
        
        except Exception as e:
            return {'success': False, 'user': None, 'error': f'Error en login: {str(e)}'}


# Instancia global del servicio
auth_service = AuthService()
