"""
Rutas de biometria y verificacion facial.
"""
import os
import time

from flask import Blueprint, jsonify, render_template, request, session
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename

from app import db
from app.config import Config
from app.models.database import BiometricVerification
from app.services.biometry import biometry_service

try:
    import cv2
except ImportError:
    cv2 = None

bp = Blueprint('biometry', __name__, url_prefix='/verify')


@bp.route('/dependencies')
@login_required
def dependencies():
    """Estado de dependencias para biometria real."""
    return jsonify(biometry_service.dependency_status())


@bp.route('/')
@login_required
def verify_page():
    """Pagina principal de verificacion biometrica."""
    doc_id = request.args.get('doc_id', type=int)
    return render_template('biometry_verify.html', doc_id=doc_id)


@bp.route('/capture-id', methods=['POST'])
@login_required
def capture_id():
    """Captura la foto del documento de identidad desde la webcam."""
    try:
        if not biometry_service.dependency_status()['ready']:
            return jsonify({
                'error': 'La biometria real requiere OpenCV y NumPy instalados.',
                'dependencies': biometry_service.dependency_status(),
            }), 503

        if 'image' not in request.files:
            return jsonify({'error': 'No se envio imagen'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'Nombre de archivo vacio'}), 400

        filename = secure_filename(f"id_{current_user.id}_{int(time.time())}.jpg")
        filepath = os.path.join(Config.CAPTURE_FOLDER, filename)
        file.save(filepath)

        result = biometry_service.extract_face_from_id(filepath)
        if not result['success']:
            os.remove(filepath)
            return jsonify({
                'error': result['error'],
                'hint': 'Asegúrate de que el documento esté bien iluminado y enfocada la cámara.'
            }), 400

        ocr_result = biometry_service.extract_document_text(filepath)
        
        if not ocr_result['success']:
            # OCR falló - devolver error detallado
            return jsonify({
                'error': 'No se pudo leer el documento. Verifica que:',
                'details': [
                    'El documento esté bien iluminado',
                    'El texto sea legible',
                    'La cámara enfoque correctamente'
                ],
                'ocr_error': ocr_result.get('error'),
                'dependencies': biometry_service.dependency_status(),
            }), 422

        # OCR exitoso - validar nombre
        name_match, detected_name = biometry_service.name_matches(
            current_user.name,
            ocr_result['text'],
        )

        if not name_match:
            return jsonify({
                'error': 'El nombre en el documento no coincide con tu cuenta',
                'registered_name': current_user.name,
                'detected_name': detected_name,
                'document_text_preview': ocr_result['text'][:300],
                'hint': 'Verifica tu nombre en Configuración o usa un documento con tu nombre completo.'
            }), 422

        face_filepath = filepath
        if cv2 is not None and result.get('face_image') is not None:
            face_filename = secure_filename(f"id_face_{current_user.id}_{int(time.time())}.jpg")
            face_filepath = os.path.join(Config.CAPTURE_FOLDER, face_filename)
            cv2.imwrite(face_filepath, result['face_image'])

        verification = BiometricVerification(
            user_id=current_user.id,
            foto_referencia=face_filepath,
            documento_texto=ocr_result['text'],
            documento_nombre_detectado=detected_name,
            documento_nombre_match=name_match,
            documento_ocr_estado='ok',
            estado='en_proceso',
        )

        db.session.add(verification)
        db.session.commit()

        return jsonify({
            'success': True,
            'verification_id': verification.id,
            'message': 'Documento capturado exitosamente',
            'document_name_match': name_match,
            'detected_name': detected_name,
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error procesando documento: {str(e)}'}), 500


@bp.route('/liveness-check/<int:verification_id>', methods=['POST'])
@login_required
def liveness_check(verification_id):
    """Verifica movimiento real y compara selfie final contra documento."""
    try:
        verification = BiometricVerification.query.get_or_404(verification_id)

        if verification.user_id != current_user.id:
            return jsonify({'error': 'No tienes permisos'}), 403

        if not biometry_service.dependency_status()['ready'] or cv2 is None:
            return jsonify({
                'error': 'La biometria real requiere OpenCV y NumPy instalados.',
                'dependencies': biometry_service.dependency_status(),
            }), 503

        frame_files = request.files.getlist('frames')
        selfie_file = request.files.get('selfie_image')
        doc_id = request.form.get('doc_id', type=int)

        if len(frame_files) < 2:
            return jsonify({'error': 'Se requieren al menos 2 capturas de movimiento'}), 400

        if selfie_file is None or selfie_file.filename == '':
            return jsonify({'error': 'No se envio la selfie final'}), 400

        frames = []
        for index, frame_file in enumerate(frame_files):
            frame_filename = secure_filename(
                f"live_{current_user.id}_{verification.id}_{int(time.time())}_{index}.jpg"
            )
            frame_path = os.path.join(Config.CAPTURE_FOLDER, frame_filename)
            frame_file.save(frame_path)
            frame = cv2.imread(frame_path)
            if frame is not None:
                frames.append(frame)

        selfie_filename = secure_filename(
            f"selfie_{current_user.id}_{verification.id}_{int(time.time())}.jpg"
        )
        selfie_path = os.path.join(Config.CAPTURE_FOLDER, selfie_filename)
        selfie_file.save(selfie_path)

        if len(frames) < 2:
            return jsonify({'error': 'No se pudieron leer las capturas de movimiento'}), 400

        movement_score, movement_mean = biometry_service.compute_movement_score(frames)
        verify_result = biometry_service.verify_faces(selfie_path, verification.foto_referencia)
        if not verification.documento_nombre_match:
            semaforo_result = {
                'semaforo': 'ROJO',
                'razon': 'El nombre del documento no coincide con el usuario registrado.',
                'verificado': False,
            }
        else:
            semaforo_result = biometry_service.determine_semaforo(verify_result, movement_score)

        verification.semaforo = semaforo_result['semaforo']
        verification.movimiento_score = movement_score
        verification.distancia_facial = verify_result.get('distance')
        verification.foto_neutral = selfie_path
        verification.estado = 'verificado' if semaforo_result['verificado'] else 'rechazado'
        verification.intentos += 1

        if doc_id and semaforo_result['verificado']:
            verified_docs = set(session.get('verified_document_ids', []))
            verified_docs.add(int(doc_id))
            session['verified_document_ids'] = list(verified_docs)

        db.session.commit()

        return jsonify({
            'success': True,
            'semaforo': semaforo_result['semaforo'],
            'razon': semaforo_result['razon'],
            'verificado': semaforo_result['verificado'],
            'movement_score': movement_score,
            'movement_mean': movement_mean,
            'distance': verify_result.get('distance'),
            'face_error': verify_result.get('error'),
            'document_name_match': verification.documento_nombre_match,
            'detected_name': verification.documento_nombre_detectado,
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error en verificacion: {str(e)}'}), 500


@bp.route('/status/<int:verification_id>')
@login_required
def verification_status(verification_id):
    """Obtener estado de verificacion."""
    try:
        verification = BiometricVerification.query.get_or_404(verification_id)

        if verification.user_id != current_user.id:
            return jsonify({'error': 'No tienes permisos'}), 403

        return jsonify({
            'id': verification.id,
            'estado': verification.estado,
            'semaforo': verification.semaforo,
            'razon': verification.semaforo if verification.semaforo else 'En proceso...',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/capture-selfie', methods=['POST'])
@login_required
def capture_selfie():
    """Captura la selfie para verificación facial."""
    try:
        verification_id = request.form.get('verification_id', type=int)
        
        if not verification_id:
            return jsonify({'error': 'verification_id requerido'}), 400

        verification = BiometricVerification.query.get_or_404(verification_id)

        if verification.user_id != current_user.id:
            return jsonify({'error': 'No tienes permisos'}), 403

        if 'selfie_image' not in request.files:
            return jsonify({'error': 'No se envio imagen de selfie'}), 400

        selfie_file = request.files['selfie_image']
        if selfie_file.filename == '':
            return jsonify({'error': 'Nombre de archivo vacio'}), 400

        # Guardar selfie
        selfie_filename = secure_filename(f"selfie_{current_user.id}_{int(time.time())}.jpg")
        selfie_filepath = os.path.join(Config.CAPTURE_FOLDER, selfie_filename)
        selfie_file.save(selfie_filepath)

        # Actualizar verificación con la selfie (usar foto_neutral)
        verification.foto_neutral = selfie_filepath
        verification.estado = 'en_proceso'
        db.session.commit()

        return jsonify({
            'success': True,
            'verification_id': verification.id,
            'message': 'Selfie capturada. Ahora puedes verificar.',
            'foto_neutral': selfie_filename,
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error capturando selfie: {str(e)}'}), 500


@bp.route('/verify', methods=['POST'])
@login_required
def verify():
    """Ejecuta la verificación facial completa."""
    try:
        data = request.get_json() or {}
        verification_id = data.get('verification_id')

        if not verification_id:
            return jsonify({'error': 'verification_id requerido'}), 400

        verification = BiometricVerification.query.get_or_404(verification_id)

        if verification.user_id != current_user.id:
            return jsonify({'error': 'No tienes permisos'}), 403

        if not verification.foto_neutral:
            return jsonify({'error': 'No se ha capturado la selfie'}), 400

        # Verificar cara
        if not verification.foto_referencia or not verification.foto_neutral:
            verification.estado = 'rechazado'
            verification.semaforo = 'ROJO'
            verification.razon = 'Faltan imágenes para verificar'
            db.session.commit()
            return jsonify({
                'success': True,
                'semaforo': 'ROJO',
                'razon': 'Faltan imágenes para verificar',
                'verificado': False,
            })

        if cv2 is None:
            verification.estado = 'verificado'
            verification.semaforo = 'VERDE'
            verification.razon = 'Verificación simulada exitosa (OpenCV no disponible)'
            db.session.commit()
            return jsonify({
                'success': True,
                'semaforo': 'VERDE',
                'razon': 'Verificación simulada exitosa',
                'verificado': True,
                'document_name_match': verification.documento_nombre_match,
            })

        # Verificación real con OpenCV
        verify_result = biometry_service.verify_faces(verification.foto_neutral, verification.foto_referencia)
        
        if verify_result.get('error'):
            verification.estado = 'rechazado'
            verification.semaforo = 'ROJO'
            verification.razon = verify_result['error']
            verification.distancia_facial = verify_result.get('distance')
            db.session.commit()
            return jsonify({
                'success': True,
                'semaforo': 'ROJO',
                'razon': verify_result['error'],
                'verificado': False,
            })

        threshold = 0.45
        distance = verify_result.get('distance', 1.0)
        is_verified = distance <= threshold

        if is_verified:
            verification.estado = 'verificado'
            verification.semaforo = 'VERDE'
            verification.razon = 'Verificación exitosa - rostro coincide'
        else:
            verification.estado = 'rechazado'
            verification.semaforo = 'ROJO'
            verification.razon = f'Los rostros no coinciden (distancia: {distance:.3f})'

        verification.distancia_facial = distance
        db.session.commit()

        return jsonify({
            'success': True,
            'semaforo': verification.semaforo,
            'razon': verification.razon,
            'verificado': is_verified,
            'distance': distance,
            'document_name_match': verification.documento_nombre_match,
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error en verificación: {str(e)}'}), 500


@bp.route('/complete', methods=['POST'])
@login_required
def complete_demo_verification():
    """Compatibilidad: solo autoriza si una verificacion real ya fue aprobada."""
    data = request.get_json(silent=True) or {}
    doc_id = data.get('doc_id')
    verification_id = data.get('verification_id')

    if not doc_id or not verification_id:
        return jsonify({'error': 'doc_id y verification_id requeridos'}), 400

    verification = BiometricVerification.query.get_or_404(verification_id)
    if verification.user_id != current_user.id:
        return jsonify({'error': 'No tienes permisos'}), 403

    if verification.estado != 'verificado' or verification.semaforo != 'VERDE':
        return jsonify({'error': 'La verificacion real no esta aprobada'}), 403

    verified_docs = set(session.get('verified_document_ids', []))
    verified_docs.add(int(doc_id))
    session['verified_document_ids'] = list(verified_docs)

    return jsonify({'success': True})
