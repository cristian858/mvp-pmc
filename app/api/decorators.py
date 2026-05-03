"""
API REST v1 - Decoradores personalizados para manejo de autenticación
"""
from functools import wraps
from flask_login import current_user
from flask import request
from app.api.utils import APIResponse


def api_login_required(f):
    """
    Decorador para requerir autenticación en endpoints de API REST.
    Devuelve JSON en lugar de redirigir a login.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return APIResponse.error(
                'unauthorized',
                'Authentication required. Please login first.',
                401
            )
        return f(*args, **kwargs)
    return decorated_function
