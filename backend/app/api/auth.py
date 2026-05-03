"""
API REST v1 - Endpoints de Autenticación
"""
from flask import Blueprint, request, session
from flask_login import login_user, logout_user, current_user
from app.services.auth import auth_service
from app.models.database import User
from app.api.utils import APIResponse, user_to_dict
from app.api.decorators import api_login_required

bp = Blueprint('api_auth', __name__, url_prefix='/api/v1/auth')


@bp.route('/register', methods=['POST'])
def register():
    """
    Registro de nuevo usuario
    
    POST /api/v1/auth/register
    {
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "password": "securepassword123",
        "password_confirm": "securepassword123"
    }
    """
    try:
        data = request.get_json() or {}
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        password_confirm = data.get('password_confirm', '')
        
        # Validar campos requeridos
        if not all([name, email, password, password_confirm]):
            return APIResponse.error('missing_fields', 'All fields are required', 400)
        
        result = auth_service.register_user(name, email, password, password_confirm)
        
        if result['success']:
            login_user(result['user'])
            return APIResponse.created(
                user_to_dict(result['user']),
                message='User registered successfully'
            )
        else:
            return APIResponse.error('registration_failed', result['error'], 400)
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/login', methods=['POST'])
def login():
    """
    Login de usuario
    
    POST /api/v1/auth/login
    {
        "email": "juan@example.com",
        "password": "securepassword123"
    }
    """
    try:
        data = request.get_json() or {}
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return APIResponse.error('missing_fields', 'Email and password are required', 400)
        
        result = auth_service.login_user(email, password)
        
        if result['success']:
            login_user(result['user'])
            return APIResponse.success(
                user_to_dict(result['user']),
                message='Login successful'
            )
        else:
            return APIResponse.error('authentication_failed', result['error'], 401)
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/logout', methods=['POST'])
@api_login_required
def logout():
    """
    Logout de usuario
    
    POST /api/v1/auth/logout
    """
    try:
        logout_user()
        return APIResponse.success(message='Logout successful')
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/me', methods=['GET'])
@api_login_required
def get_current_user():
    """
    Obtener información del usuario actual
    
    GET /api/v1/auth/me
    """
    try:
        return APIResponse.success(user_to_dict(current_user))
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/check', methods=['GET'])
def check_auth():
    """
    Verificar si el usuario está autenticado
    
    GET /api/v1/auth/check
    """
    try:
        if current_user.is_authenticated:
            return APIResponse.success(
                {
                    'authenticated': True,
                    'user': user_to_dict(current_user)
                }
            )
        else:
            return APIResponse.success(
                {'authenticated': False},
                status_code=200
            )
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)
