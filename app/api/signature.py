"""
API REST v1 - Endpoints de Firma Digital
"""
from flask import Blueprint, request
from flask_login import login_required, current_user
from app import db
from app.models.database import Signature, Document
from app.api.utils import APIResponse, signature_to_dict

bp = Blueprint('api_signature', __name__, url_prefix='/api/v1/signatures')


@bp.route('', methods=['GET'])
@login_required
def list_signatures():
    """
    Listar firmas del usuario autenticado
    
    GET /api/v1/signatures?page=1&per_page=10
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Signature.query.filter_by(user_id=current_user.id).order_by(
            Signature.fecha_firma.desc()
        )
        total = query.count()
        
        signatures = query.paginate(page=page, per_page=per_page, error_out=False).items
        
        return APIResponse.paginated(
            [signature_to_dict(sig) for sig in signatures],
            total=total,
            page=page,
            per_page=per_page
        )
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/<int:sig_id>', methods=['GET'])
@login_required
def get_signature(sig_id):
    """
    Obtener detalles de una firma
    
    GET /api/v1/signatures/1
    """
    try:
        signature = Signature.query.get_or_404(sig_id)
        
        if signature.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to access this signature', 403)
        
        return APIResponse.success(signature_to_dict(signature))
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/document/<int:doc_id>', methods=['GET'])
@login_required
def get_document_signatures(doc_id):
    """
    Obtener todas las firmas de un documento específico
    
    GET /api/v1/signatures/document/1
    """
    try:
        document = Document.query.get_or_404(doc_id)
        
        if document.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to access this document', 403)
        
        signatures = Signature.query.filter_by(document_id=doc_id).order_by(
            Signature.fecha_firma.desc()
        ).all()
        
        return APIResponse.success(
            [signature_to_dict(sig) for sig in signatures],
            message=f'Found {len(signatures)} signatures for document'
        )
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/document/<int:doc_id>/create', methods=['POST'])
@login_required
def create_signature(doc_id):
    """
    Crear una nueva firma para un documento
    
    POST /api/v1/signatures/document/1/create
    {
        "resultado_verificacion": "VERDE",
        "notas": "Firma válida según verificación biométrica"
    }
    """
    try:
        document = Document.query.get_or_404(doc_id)
        
        if document.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to sign this document', 403)
        
        data = request.get_json() or {}
        resultado = data.get('resultado_verificacion', 'VERDE').upper()
        notas = data.get('notas', '')
        
        valid_results = ['VERDE', 'AMARILLO', 'ROJO']
        if resultado not in valid_results:
            return APIResponse.error(
                'invalid_result',
                f'resultado_verificacion must be one of: {", ".join(valid_results)}',
                400
            )
        
        signature = Signature(
            user_id=current_user.id,
            document_id=doc_id,
            resultado_verificacion=resultado,
            notas=notas
        )
        
        db.session.add(signature)
        db.session.commit()
        
        return APIResponse.created(
            signature_to_dict(signature),
            message='Signature created successfully'
        )
    
    except Exception as e:
        db.session.rollback()
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/<int:sig_id>/update', methods=['PATCH'])
@login_required
def update_signature(sig_id):
    """
    Actualizar una firma existente
    
    PATCH /api/v1/signatures/1/update
    {
        "resultado_verificacion": "AMARILLO",
        "notas": "Verificación parcial"
    }
    """
    try:
        signature = Signature.query.get_or_404(sig_id)
        
        if signature.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to update this signature', 403)
        
        data = request.get_json() or {}
        
        if 'resultado_verificacion' in data:
            resultado = data['resultado_verificacion'].upper()
            valid_results = ['VERDE', 'AMARILLO', 'ROJO']
            if resultado not in valid_results:
                return APIResponse.error(
                    'invalid_result',
                    f'resultado_verificacion must be one of: {", ".join(valid_results)}',
                    400
                )
            signature.resultado_verificacion = resultado
        
        if 'notas' in data:
            signature.notas = data['notas']
        
        db.session.commit()
        
        return APIResponse.success(
            signature_to_dict(signature),
            message='Signature updated successfully'
        )
    
    except Exception as e:
        db.session.rollback()
        return APIResponse.error('internal_error', str(e), 500)
