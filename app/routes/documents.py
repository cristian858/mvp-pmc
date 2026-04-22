"""
Rutas de documentos
"""
import os
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.models.database import Document
from app.services.document_processor import document_processor
from app.services.ai_analyzer import ai_analyzer
from app.config import Config

bp = Blueprint('documents', __name__, url_prefix='')

ALLOWED_EXTENSIONS = {'pdf'}


def allowed_file(filename):
    """Verifica si la extensión del archivo es permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.route('/dashboard')
@login_required
def dashboard():
    """Dashboard del usuario con lista de documentos"""
    documents = Document.query.filter_by(user_id=current_user.id).order_by(Document.created_at.desc()).all()
    return render_template('dashboard.html', documents=documents)


@bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    """Subida de documento PDF"""
    if request.method == 'POST':
        # Validar archivo
        if 'file' not in request.files:
            flash('No se seleccionó archivo', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('No se seleccionó archivo', 'error')
            return redirect(request.url)
        
        if not allowed_file(file.filename):
            flash('Solo se permiten archivos PDF', 'error')
            return redirect(request.url)
        
        try:
            # Guardar archivo
            filename = secure_filename(file.filename)
            # Añadir timestamp para evitar colisiones
            import time
            filename = f"{int(time.time())}_{filename}"
            filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Extraer texto del PDF
            extraction_result = document_processor.extract_text_from_pdf(filepath)
            if not extraction_result['success']:
                os.remove(filepath)
                flash(f'Error extrayendo texto del PDF: {extraction_result["error"]}', 'error')
                return redirect(request.url)
            
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
            
            flash('¡Documento subido y analizado exitosamente!', 'success')
            return redirect(url_for('documents.view_document', doc_id=document.id))
        
        except Exception as e:
            db.session.rollback()
            flash(f'Error subiendo documento: {str(e)}', 'error')
            return redirect(request.url)
    
    return render_template('upload.html')


@bp.route('/document/<int:doc_id>')
@login_required
def view_document(doc_id):
    """Ver documento y su análisis"""
    document = Document.query.get_or_404(doc_id)
    
    # Verificar que el documento pertenezca al usuario
    if document.user_id != current_user.id:
        flash('No tienes permisos para ver este documento', 'error')
        return redirect(url_for('documents.dashboard'))
    
    return render_template('document_view.html', document=document)


@bp.route('/document/<int:doc_id>/delete', methods=['POST'])
@login_required
def delete_document(doc_id):
    """Eliminar documento"""
    document = Document.query.get_or_404(doc_id)
    
    # Verificar permisos
    if document.user_id != current_user.id:
        return jsonify({'error': 'No tienes permisos'}), 403
    
    try:
        # Eliminar archivo físico
        if os.path.exists(document.filepath):
            os.remove(document.filepath)
        
        # Eliminar de BD
        db.session.delete(document)
        db.session.commit()
        
        return jsonify({'success': True})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
