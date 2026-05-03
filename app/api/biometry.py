"""
API REST v1 - Endpoints de Biometría
"""
from flask import Blueprint, request
from flask_login import login_required, current_user
from app import db
from app.models.database import BiometricVerification
from app.api.utils import APIResponse, biometric_verification_to_dict

bp = Blueprint('api_biometry', __name__, url_prefix='/api/v1/biometry')


@bp.route('', methods=['GET'])
@login_required
def list_verifications():
    """
    Listar verificaciones biométricas del usuario
    
    GET /api/v1/biometry?page=1&per_page=10
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = BiometricVerification.query.filter_by(user_id=current_user.id).order_by(
            BiometricVerification.created_at.desc()
        )
        total = query.count()
        
        verifications = query.paginate(page=page, per_page=per_page, error_out=False).items
        
        return APIResponse.paginated(
            [biometric_verification_to_dict(v) for v in verifications],
            total=total,
            page=page,
            per_page=per_page
        )
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/<int:verification_id>', methods=['GET'])
@login_required
def get_verification(verification_id):
    """
    Obtener detalles de una verificación biométrica
    
    GET /api/v1/biometry/1
    """
    try:
        verification = BiometricVerification.query.get_or_404(verification_id)
        
        if verification.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to access this verification', 403)
        
        data = biometric_verification_to_dict(verification)
        data['documento_texto'] = verification.documento_texto
        
        return APIResponse.success(data)
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/<int:verification_id>/status', methods=['GET'])
@login_required
def get_verification_status(verification_id):
    """
    Obtener el estado actual de una verificación
    
    GET /api/v1/biometry/1/status
    """
    try:
        verification = BiometricVerification.query.get_or_404(verification_id)
        
        if verification.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to access this verification', 403)
        
        return APIResponse.success({
            'id': verification.id,
            'estado': verification.estado,
            'semaforo': verification.semaforo,
            'intentos': verification.intentos,
            'documento_nombre_match': verification.documento_nombre_match
        })
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)
