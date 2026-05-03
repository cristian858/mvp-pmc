"""
Utilidades para la API REST
"""
from flask import jsonify
from datetime import datetime


class APIResponse:
    """Clase para estandarizar respuestas de API"""
    
    @staticmethod
    def success(data=None, message="Success", status_code=200):
        """Respuesta exitosa"""
        response = {
            'success': True,
            'message': message,
            'data': data
        }
        return jsonify(response), status_code
    
    @staticmethod
    def error(error, message=None, status_code=400):
        """Respuesta con error"""
        response = {
            'success': False,
            'error': error,
            'message': message or error
        }
        return jsonify(response), status_code
    
    @staticmethod
    def created(data, message="Resource created successfully", status_code=201):
        """Respuesta de recurso creado"""
        response = {
            'success': True,
            'message': message,
            'data': data
        }
        return jsonify(response), status_code
    
    @staticmethod
    def paginated(items, total, page, per_page, message="Success", status_code=200):
        """Respuesta paginada"""
        response = {
            'success': True,
            'message': message,
            'data': items,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            }
        }
        return jsonify(response), status_code


def serialize_datetime(dt):
    """Convertir datetime a string ISO"""
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt


def user_to_dict(user):
    """Convertir usuario a diccionario"""
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'created_at': serialize_datetime(user.created_at)
    }


def document_to_dict(document):
    """Convertir documento a diccionario"""
    return {
        'id': document.id,
        'filename': document.filename,
        'status': document.status,
        'created_at': serialize_datetime(document.created_at),
        'updated_at': serialize_datetime(document.updated_at),
        'resumen_ia': document.resumen_ia,
        'riesgos': document.riesgos,
        'obligaciones': document.obligaciones
    }


def signature_to_dict(signature):
    """Convertir firma a diccionario"""
    return {
        'id': signature.id,
        'document_id': signature.document_id,
        'resultado_verificacion': signature.resultado_verificacion,
        'fecha_firma': serialize_datetime(signature.fecha_firma),
        'notas': signature.notas
    }


def biometric_verification_to_dict(verification):
    """Convertir verificación biométrica a diccionario"""
    return {
        'id': verification.id,
        'estado': verification.estado,
        'semaforo': verification.semaforo,
        'movimiento_score': verification.movimiento_score,
        'distancia_facial': verification.distancia_facial,
        'documento_nombre_match': verification.documento_nombre_match,
        'intentos': verification.intentos,
        'created_at': serialize_datetime(verification.created_at)
    }
