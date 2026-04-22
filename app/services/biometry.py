"""
Servicio de biometría y verificación facial
Refactorización del código verify.py original
"""
import os
import re
import shutil
import unicodedata
from difflib import SequenceMatcher
from datetime import datetime
from itertools import combinations
from app.config import Config

try:
    import numpy as np
except ImportError:
    np = None

try:
    import cv2
except ImportError:
    cv2 = None

try:
    from deepface import DeepFace
except ImportError:
    DeepFace = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

if pytesseract is not None and Config.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = Config.TESSERACT_CMD


class BiometryService:
    """Servicio de verificación biométrica"""
    
    def __init__(self):
        self.umbral_movimiento = Config.UMBRAL_MOVIMIENTO
        self.capture_folder = Config.CAPTURE_FOLDER
        self.face_cascade = None
        if cv2 is not None:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )

    def dependency_status(self):
        """Retorna el estado de dependencias necesarias para biometria real."""
        return {
            'opencv': cv2 is not None,
            'numpy': np is not None,
            'deepface': DeepFace is not None,
            'pytesseract': pytesseract is not None,
            'tesseract_binary': bool(Config.TESSERACT_CMD) or shutil.which('tesseract') is not None,
            'ready': cv2 is not None and np is not None,
        }

    def normalize_name(self, value):
        """Normaliza nombres para comparaciones tolerantes a tildes y espacios."""
        if not value:
            return ''
        normalized = unicodedata.normalize('NFKD', value)
        ascii_text = ''.join(char for char in normalized if not unicodedata.combining(char))
        return re.sub(r'[^A-Z ]+', ' ', ascii_text.upper()).strip()

    def name_matches(self, user_name, document_text):
        """Valida nombre con tolerancia a OCR parcial, tildes y orden de apellidos."""
        normalized_user = self.normalize_name(user_name)
        normalized_doc = self.normalize_name(document_text)
        user_tokens = [token for token in normalized_user.split() if len(token) >= 3]
        doc_tokens = [token for token in normalized_doc.split() if len(token) >= 3]

        if not user_tokens or not doc_tokens:
            return False, None

        matched = []
        for user_token in user_tokens:
            exact = user_token in normalized_doc
            fuzzy = any(
                SequenceMatcher(None, user_token, doc_token).ratio() >= 0.74
                for doc_token in doc_tokens
            )
            if exact or fuzzy:
                matched.append(user_token)

        unique_matches = list(dict.fromkeys(matched))
        match_count = len(unique_matches)
        required = len(user_tokens)
        best_phrase = None
        best_phrase_score = 0.0

        # OCR de documentos suele partir apellidos: "GONZALEZ" puede salir como
        # "NTA EZ". Comparamos ventanas de tokens concatenadas contra nombres y
        # apellidos concatenados para tolerar espacios falsos y letras perdidas.
        user_phrases = []
        if len(user_tokens) >= 2:
            user_phrases.extend([''.join(user_tokens[i:i + 2]) for i in range(len(user_tokens) - 1)])
            user_phrases.append(''.join(user_tokens[-2:]))
        user_phrases.append(''.join(user_tokens))

        doc_windows = []
        for size in (2, 3, 4):
            for index in range(max(0, len(doc_tokens) - size + 1)):
                window_tokens = doc_tokens[index:index + size]
                doc_windows.append((' '.join(window_tokens), ''.join(window_tokens)))

        for user_phrase in user_phrases:
            for display, compact_doc in doc_windows:
                score = SequenceMatcher(None, user_phrase, compact_doc).ratio()
                if score > best_phrase_score:
                    best_phrase_score = score
                    best_phrase = display

        # Cedulas y pasaportes suelen imprimir apellidos/nombres en lineas separadas.
        # Si OCR solo lee bien una linea, dos tokens fuertes son suficientes para
        # confirmar identidad en este MVP junto con la validacion facial.
        if required <= 2:
            is_match = match_count == required
        else:
            is_match = match_count >= 2 or (match_count / required) >= 0.5
            is_match = is_match or (match_count >= 1 and best_phrase_score >= 0.50)

        detected = ' '.join(unique_matches)
        if best_phrase and best_phrase_score >= 0.50:
            detected = f"{detected} {best_phrase}".strip()
        return is_match, detected

    def _ocr_candidates(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        height, width = gray.shape[:2]

        # Cedula nueva: foto grande izquierda, datos a la derecha.
        new_id_text_zone = gray[int(height * 0.12):int(height * 0.88), int(width * 0.38):int(width * 0.86)]

        # Cedula vieja: nombres/apellidos grandes al lado izquierdo.
        old_id_name_zone = gray[int(height * 0.18):int(height * 0.58), 0:int(width * 0.62)]

        # Cedula vieja alternativa: casi todo el frente menos margen inferior.
        broad_text_zone = gray[int(height * 0.05):int(height * 0.72), 0:int(width * 0.85)]

        scaled = cv2.resize(gray, None, fx=2.2, fy=2.2, interpolation=cv2.INTER_CUBIC)
        zone_candidates = [new_id_text_zone, old_id_name_zone, broad_text_zone]

        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        processed = [gray, scaled]

        for candidate in zone_candidates:
            if candidate.size == 0:
                continue
            processed.append(candidate)
            processed.append(cv2.resize(candidate, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC))

        expanded = []
        for candidate in processed:
            denoised = cv2.bilateralFilter(candidate, 9, 75, 75)
            sharpened = cv2.filter2D(denoised, -1, kernel)
            _, otsu = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            expanded.extend([sharpened, otsu])

        return expanded[:10]

    def extract_document_text(self, image_path):
        """Extrae texto OCR de una cedula/pasaporte usando Tesseract local."""
        if pytesseract is None:
            return {
                'success': False,
                'text': '',
                'error': 'pytesseract no esta instalado en el entorno virtual.'
            }

        if not Config.TESSERACT_CMD and shutil.which('tesseract') is None:
            return {
                'success': False,
                'text': '',
                'error': 'Tesseract OCR no esta instalado en Windows o no esta en PATH.'
            }

        if cv2 is None:
            return {
                'success': False,
                'text': '',
                'error': 'OpenCV no esta instalado para preprocesar el documento.'
            }

        image = cv2.imread(image_path)
        if image is None:
            return {
                'success': False,
                'text': '',
                'error': 'No se pudo leer la imagen del documento para OCR.'
            }

        try:
            languages = set(pytesseract.get_languages(config=''))
            lang = 'spa+eng' if 'spa' in languages else 'eng'
            texts = []
            for candidate in self._ocr_candidates(image):
                for psm in (6, 11):
                    candidate_text = pytesseract.image_to_string(
                        candidate,
                        lang=lang,
                        config=f'--psm {psm}'
                    )
                    candidate_text = candidate_text.strip()
                    if candidate_text and candidate_text not in texts:
                        texts.append(candidate_text)
        except Exception as exc:
            return {
                'success': False,
                'text': '',
                'error': f'Error ejecutando OCR: {exc}'
            }

        text = '\n'.join(texts).strip()
        return {
            'success': bool(text),
            'text': text,
            'error': None if text else 'OCR no encontro texto legible en el documento.'
        }

    def _extract_face_gray(self, image_path):
        if cv2 is None or np is None or self.face_cascade is None:
            return None

        image = cv2.imread(image_path)
        if image is None:
            return None

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
        )

        if len(faces) == 0:
            face = gray
        else:
            x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])
            face = gray[y:y + h, x:x + w]

        face = cv2.resize(face, (160, 160))
        face = cv2.equalizeHist(face)
        return face

    def _opencv_verify_faces(self, captured_path, reference_path):
        captured = self._extract_face_gray(captured_path)
        reference = self._extract_face_gray(reference_path)

        if captured is None or reference is None:
            return {
                'verified': False,
                'distance': None,
                'error': 'No se pudieron leer las imagenes para comparacion facial con OpenCV.',
                'mode': 'opencv'
            }

        diff = cv2.absdiff(captured, reference)
        mean_diff = float(np.mean(diff) / 255.0)

        captured_hist = cv2.calcHist([captured], [0], None, [64], [0, 256])
        reference_hist = cv2.calcHist([reference], [0], None, [64], [0, 256])
        cv2.normalize(captured_hist, captured_hist)
        cv2.normalize(reference_hist, reference_hist)
        hist_corr = float(cv2.compareHist(captured_hist, reference_hist, cv2.HISTCMP_CORREL))

        # OpenCV fallback: distancia menor y correlacion mayor indican mayor similitud.
        verified = mean_diff <= 0.25 or (mean_diff <= 0.45 and hist_corr >= 0.15)
        return {
            'verified': verified,
            'distance': mean_diff,
            'error': None if verified else 'La comparacion OpenCV no encontro suficiente similitud facial.',
            'mode': 'opencv',
            'histogram_correlation': hist_corr
        }
    
    def verify_faces(self, captured_path, reference_path):
        """
        Verifica si dos rostros coinciden usando DeepFace + ArcFace
        
        Args:
            captured_path (str): Ruta de la imagen capturada
            reference_path (str): Ruta de la imagen de referencia
        
        Returns:
            dict: Resultado de verificación con 'verified', 'distance', 'error'
        """
        try:
            if DeepFace is None:
                return self._opencv_verify_faces(captured_path, reference_path)

            if not os.path.exists(reference_path):
                return {
                    'verified': False,
                    'distance': None,
                    'error': f'Imagen de referencia no encontrada: {reference_path}'
                }
            
            if not os.path.exists(captured_path):
                return {
                    'verified': False,
                    'distance': None,
                    'error': f'Imagen capturada no encontrada: {captured_path}'
                }
            
            # Usar DeepFace con ArcFace
            result = DeepFace.verify(
                img1_path=captured_path,
                img2_path=reference_path,
                model_name='ArcFace',
                detector_backend='retinaface',
                enforce_detection=False
            )
            
            return {
                'verified': result['verified'],
                'distance': float(result['distance']),
                'error': None
            }
        
        except Exception as e:
            return {
                'verified': False,
                'distance': None,
                'error': f'Error en verificación: {str(e)}'
            }
    
    def compute_movement_score(self, frames):
        """
        Calcula movimiento real entre fotos de la prueba de vida.
        Combina diferencias de imagen completa, cambios del rostro y
        desplazamiento del centro de la cara.
        """
        if len(frames) < 2:
            return 0.0, 0.0

        if cv2 is None or np is None:
            return 0.0, 0.0

        full_frames = []
        face_rois = []
        face_centers = []

        for frame in frames:
            if frame is None:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            normalized = cv2.resize(gray, (160, 160))
            normalized = cv2.equalizeHist(normalized)
            full_frames.append(normalized)

            faces = []
            if self.face_cascade is not None:
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(70, 70)
                )

            if len(faces) > 0:
                (x, y, w, h) = max(faces, key=lambda rect: rect[2] * rect[3])
                roi = gray[y:y+h, x:x+w]
                roi = cv2.resize(roi, (160, 160))
                roi = cv2.equalizeHist(roi)
                face_rois.append(roi)
                face_centers.append(
                    (
                        (x + (w / 2)) / gray.shape[1],
                        (y + (h / 2)) / gray.shape[0],
                    )
                )

        if len(full_frames) < 2:
            return 0.0, 0.0

        def pairwise_pixel_score(images):
            diffs = []
            for i, j in combinations(range(len(images)), 2):
                diff = cv2.absdiff(images[i], images[j])
                diffs.append(float(np.mean(diff) / 255.0))
            if not diffs:
                return 0.0, 0.0
            return max(diffs), float(np.mean(diffs))

        full_max, full_mean = pairwise_pixel_score(full_frames)
        face_max, face_mean = (0.0, 0.0)
        if len(face_rois) >= 2:
            face_max, face_mean = pairwise_pixel_score(face_rois)

        center_score = 0.0
        if len(face_centers) >= 2:
            center_distances = []
            for i, j in combinations(range(len(face_centers)), 2):
                dx = face_centers[i][0] - face_centers[j][0]
                dy = face_centers[i][1] - face_centers[j][1]
                center_distances.append(float((dx * dx + dy * dy) ** 0.5))
            center_score = max(center_distances) if center_distances else 0.0

        max_diff = max(full_max, face_max, center_score)
        mean_diff = max(full_mean, face_mean, center_score)

        return max_diff, mean_diff

    def compute_movement_score_legacy(self, frames):
        """
        Calcula el score de movimiento entre frames
        Detecta si la persona se está moviendo activamente (liveness detection)
        
        Args:
            frames (list): Lista de frames (imágenes numpy)
        
        Returns:
            tuple: (max_diff, mean_diff) - diferencias máxima y promedio
        """
        if len(frames) < 2:
            return 0.0, 0.0

        if cv2 is None or np is None or self.face_cascade is None:
            return 0.0, 0.0
        
        rois = []
        for frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
            )
            
            if len(faces) == 0:
                rois.append(gray)
            else:
                # Obtener el rostro más grande
                (x, y, w, h) = max(faces, key=lambda rect: rect[2] * rect[3])
                roi = gray[y:y+h, x:x+w]
                rois.append(roi)
        
        if len(rois) < 2:
            return 0.0, 0.0
        
        # Redimensionar todos los ROIs al tamaño del primero
        target_size = rois[0].shape
        rois_resized = []
        for roi in rois:
            if roi.shape != target_size:
                roi = cv2.resize(roi, (target_size[1], target_size[0]))
            rois_resized.append(roi)
        
        # Calcular diferencias entre pares de frames
        diffs = []
        for i, j in combinations(range(len(rois_resized)), 2):
            diff = cv2.absdiff(rois_resized[i], rois_resized[j])
            mean_diff = np.mean(diff) / 255.0
            diffs.append(mean_diff)
        
        max_diff = max(diffs) if diffs else 0.0
        mean_diff = np.mean(diffs) if diffs else 0.0
        
        return max_diff, mean_diff
    
    def determine_semaforo(self, verification_result, movement_score):
        """
        Determina el semáforo según resultado de verificación y movimiento
        
        Args:
            verification_result (dict): Resultado de verify_faces()
            movement_score (float): Score de movimiento (0-1)
        
        Returns:
            dict: {'semaforo': 'VERDE'|'ROJO', 'razon': str}
        """
        if not verification_result['verified']:
            return {
                'semaforo': 'ROJO',
                'razon': 'No coinciden los rostros. No hay identidad verificada.',
                'verificado': False
            }
        
        # Si está verificado, revisar movimiento
        if movement_score >= self.umbral_movimiento:
            return {
                'semaforo': 'VERDE',
                'razon': 'Verificación exitosa. Movimiento detectado.',
                'verificado': True
            }
        else:
            return {
                'semaforo': 'ROJO',
                'razon': 'Verificacion rechazada: no se detecto movimiento suficiente.',
                'verificado': False
            }
    
    def save_captured_frames(self, frames, prefix='verif'):
        """
        Guarda frames capturados en carpeta
        
        Args:
            frames (list): Lista de frames (imágenes numpy)
            prefix (str): Prefijo para los nombres de archivo
        
        Returns:
            list: Lista de rutas guardadas
        """
        os.makedirs(self.capture_folder, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_paths = []

        if cv2 is None:
            return saved_paths
        
        for i, frame in enumerate(frames):
            filename = f"{timestamp}_{prefix}_{i+1}.jpg"
            path = os.path.join(self.capture_folder, filename)
            cv2.imwrite(path, frame)
            saved_paths.append(path)
        
        return saved_paths
    
    def extract_face_from_id(self, id_image_path):
        """
        Extrae el rostro de una imagen de documento de identidad
        
        Args:
            id_image_path (str): Ruta de la imagen del documento
        
        Returns:
            dict: {'success': bool, 'face_image': np.ndarray, 'error': str}
        """
        try:
            if cv2 is None:
                return {
                    'success': False,
                    'face_image': None,
                    'error': 'OpenCV no esta instalado. Instala requirements.txt para capturar biometria real.'
                }

            image = cv2.imread(id_image_path)
            if image is None:
                return {
                    'success': False,
                    'face_image': None,
                    'error': 'No se pudo leer la imagen'
                }
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100)
            )
            
            if len(faces) == 0:
                return {
                    'success': True,
                    'face_image': None,
                    'error': None,
                    'warning': 'No se detecto rostro con OpenCV; se usara la imagen completa.'
                }
            
            # Obtener el rostro más grande
            (x, y, w, h) = max(faces, key=lambda rect: rect[2] * rect[3])
            face_image = image[y:y+h, x:x+w]
            
            return {
                'success': True,
                'face_image': face_image,
                'error': None,
                'coordinates': (x, y, w, h)
            }
        
        except Exception as e:
            return {
                'success': False,
                'face_image': None,
                'error': f'Error extrayendo rostro: {str(e)}'
            }


# Instancia global del servicio
biometry_service = BiometryService()
