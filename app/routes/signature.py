"""
Rutas de firma digital
"""
import os
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash, session
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.models.database import Signature, Document
from app.config import Config

bp = Blueprint('signature', __name__, url_prefix='/sign')


@bp.route('/<int:doc_id>')
@login_required
def signature_pad(doc_id):
    """Página del lienzo de firma"""
    document = Document.query.get_or_404(doc_id)
    
    # Verificar permisos
    if document.user_id != current_user.id:
        return redirect(url_for('documents.dashboard'))
    
    # Verificar que el documento no esté ya firmado
    if document.status == 'firmado':
        return render_template('error.html', message='Este documento ya ha sido firmado')

    verified_docs = session.get('verified_document_ids', [])
    if document.id not in verified_docs:
        flash('Primero debes verificar tu identidad para firmar este documento.', 'warning')
        return redirect(url_for('biometry.verify_page', doc_id=document.id))
    
    return render_template('signature_pad.html', document=document)


@bp.route('/upload', methods=['POST'])
@login_required
def upload_signature():
    """Endpoint para guardar firma (imagen + video)"""
    try:
        doc_id = request.form.get('doc_id')
        if not doc_id:
            return jsonify({'error': 'doc_id requerido'}), 400
        
        document = Document.query.get_or_404(doc_id)
        
        # Verificar permisos
        if document.user_id != current_user.id:
            return jsonify({'error': 'No tienes permisos'}), 403
        
        # Verificar archivo de imagen
        if 'signature_image' not in request.files:
            return jsonify({'error': 'No se envió imagen de firma'}), 400
        
        image_file = request.files['signature_image']
        if image_file.filename == '':
            return jsonify({'error': 'Nombre de archivo vacío'}), 400
        
        # Guardar imagen
        image_filename = secure_filename(
            f"sig_{current_user.id}_{document.id}_{os.urandom(4).hex()}.png"
        )
        image_path = os.path.join(Config.SIGNATURE_FOLDER, image_filename)
        image_file.save(image_path)
        
        # Guardar video si se envía
        video_path = None
        if 'signature_video' in request.files:
            video_file = request.files['signature_video']
            if video_file.filename != '':
                video_filename = secure_filename(
                    f"sig_{current_user.id}_{document.id}_{os.urandom(4).hex()}.webm"
                )
                video_path = os.path.join(Config.SIGNATURE_FOLDER, video_filename)
                video_file.save(video_path)
        
        # Crear registro de firma
        signature = Signature(
            user_id=current_user.id,
            document_id=document.id,
            firma_imagen=image_path,
            firma_video=video_path,
            resultado_verificacion='VERDE'  # Por ahora, siempre verificado
        )
        
        # Actualizar estado del documento
        document.status = 'firmado'
        
        db.session.add(signature)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '¡Documento firmado exitosamente!',
            'signature_id': signature.id
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error guardando firma: {str(e)}'}), 500


@bp.route('/result/<int:sig_id>')
@login_required
def signature_result(sig_id):
    """Ver resultado de la firma"""
    signature = Signature.query.get_or_404(sig_id)
    
    # Verificar permisos
    if signature.user_id != current_user.id:
        return redirect(url_for('documents.dashboard'))
    
    return render_template('signature_result.html', signature=signature)
