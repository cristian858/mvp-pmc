"""
API REST v1 - Endpoints de Documentos
"""
import os
from flask import Blueprint, request
from flask_login import current_user
from werkzeug.utils import secure_filename
from app import db
from app.models.database import Document
from app.services.document_processor import document_processor
from app.services.ai_analyzer import ai_analyzer
from app.config import Config
from app.api.utils import APIResponse, document_to_dict
from app.api.decorators import api_login_required

bp = Blueprint('api_documents', __name__, url_prefix='/api/v1/documents')

ALLOWED_EXTENSIONS = {'pdf'}


def allowed_file(filename):
    """Verifica si la extensión del archivo es permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.route('', methods=['GET'])
@api_login_required
def list_documents():
    """
    Listar documentos del usuario autenticado
    
    GET /api/v1/documents?page=1&per_page=10
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Document.query.filter_by(user_id=current_user.id).order_by(Document.created_at.desc())
        total = query.count()
        
        documents = query.paginate(page=page, per_page=per_page, error_out=False).items
        
        return APIResponse.paginated(
            [document_to_dict(doc) for doc in documents],
            total=total,
            page=page,
            per_page=per_page
        )
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/<int:doc_id>', methods=['GET'])
@api_login_required
def get_document(doc_id):
    """
    Obtener detalles de un documento específico
    
    GET /api/v1/documents/1
    """
    try:
        document = Document.query.get_or_404(doc_id)
        
        # Verificar que el documento pertenezca al usuario
        if document.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to access this document', 403)
        
        doc_data = document_to_dict(document)
        doc_data['contenido_texto'] = document.contenido_texto
        
        return APIResponse.success(doc_data)
    
    except Exception as e:
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('', methods=['POST'])
@api_login_required
def upload_document():
    """
    Subir y analizar un nuevo documento PDF
    
    POST /api/v1/documents
    Content-Type: multipart/form-data
    
    file: <PDF file>
    """
    try:
        # Validar que se envió un archivo
        if 'file' not in request.files:
            return APIResponse.error('missing_file', 'No file provided', 400)
        
        file = request.files['file']
        
        if file.filename == '':
            return APIResponse.error('empty_filename', 'File has no name', 400)
        
        if not allowed_file(file.filename):
            return APIResponse.error('invalid_file_type', 'Only PDF files are allowed', 400)
        
        # Guardar archivo
        filename = secure_filename(file.filename)
        import time
        filename = f"{int(time.time())}_{filename}"
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Extraer texto del PDF
        extraction_result = document_processor.extract_text_from_pdf(filepath)
        if not extraction_result['success']:
            os.remove(filepath)
            return APIResponse.error(
                'extraction_failed',
                f'Error extracting text from PDF: {extraction_result["error"]}',
                400
            )
        
        text = extraction_result['text']
        
        # Analizar con IA
        analysis = ai_analyzer.analyze_contract(text)
        
        # Guardar documento en BD
        document = Document(
            user_id=current_user.id,
            filename=file.filename,
            filepath=filepath,
            contenido_texto=text,
            resumen_ia=analysis['resumen'],
            obligaciones='\n'.join(analysis['obligaciones']),
            riesgos='\n'.join(analysis['riesgos']),
            status='pendiente'
        )
        
        db.session.add(document)
        db.session.commit()
        
        return APIResponse.created(
            document_to_dict(document),
            message='Document uploaded and analyzed successfully'
        )
    
    except Exception as e:
        db.session.rollback()
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/<int:doc_id>', methods=['DELETE'])
@api_login_required
def delete_document(doc_id):
    """
    Eliminar un documento
    
    DELETE /api/v1/documents/1
    """
    try:
        document = Document.query.get_or_404(doc_id)
        
        # Verificar permisos
        if document.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to delete this document', 403)
        
        # Eliminar archivo físico
        if os.path.exists(document.filepath):
            os.remove(document.filepath)
        
        # Eliminar de BD
        db.session.delete(document)
        db.session.commit()
        
        return APIResponse.success(message='Document deleted successfully')
    
    except Exception as e:
        db.session.rollback()
        return APIResponse.error('internal_error', str(e), 500)


@bp.route('/<int:doc_id>/status', methods=['PATCH'])
@api_login_required
def update_document_status(doc_id):
    """
    Actualizar el estado de un documento
    
    PATCH /api/v1/documents/1/status
    {
        "status": "firmado"  # pendiente, firmado, rechazado
    }
    """
    try:
        document = Document.query.get_or_404(doc_id)
        
        if document.user_id != current_user.id:
            return APIResponse.error('forbidden', 'You do not have permission to update this document', 403)
        
        data = request.get_json() or {}
        status = data.get('status', '').strip().lower()
        
        valid_statuses = ['pendiente', 'firmado', 'rechazado']
        if status not in valid_statuses:
            return APIResponse.error('invalid_status', f'Status must be one of: {", ".join(valid_statuses)}', 400)
        
        document.status = status
        db.session.commit()
        
        return APIResponse.success(
            document_to_dict(document),
            message='Document status updated successfully'
        )
    
    except Exception as e:
        db.session.rollback()
        return APIResponse.error('internal_error', str(e), 500)
