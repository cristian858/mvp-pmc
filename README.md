# SafeSign AI - Plataforma de Firma Digital Inteligente

Una aplicación web moderna para firmar documentos de forma segura utilizando inteligencia artificial, verificación biométrica y reconocimiento facial.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

1. **Autenticación Segura**
   - Registro de usuarios con validación de email
   - Login con hash de contraseñas (Werkzeug)
   - Sesiones seguras con Flask-Login
   - Rutas protegidas con @login_required

2. **Gestión de Documentos**
   - Subida de archivos PDF
   - Extracción automática de texto (PyPDF2)
   - Almacenamiento seguro en base de datos

3. **Análisis Inteligente con IA**
   - Análisis automático de contratos
   - Generación de resúmenes claros
   - Identificación de obligaciones principales
   - Detección de riesgos y cláusulas peligrosas
   - **Modo Mock** (análisis con regex) por defecto
   - **Preparado** para integración con OpenAI/Claude API

4. **Verificación Biométrica** (desde código existente)
   - Verificación facial real con cámara usando OpenCV
   - Preparado para reconocimiento avanzado con DeepFace + ArcFace
   - Detección de movimiento (Liveness Detection)
   - Sistema de semáforos (VERDE/AMARILLO/ROJO)
   - Extracción de rostro de documentos

5. **Firma Digital**
   - Lienzo de firma interactivo
   - Almacenamiento seguro de firmas
   - Registro de metadatos (usuario, fecha, documento)

6. **Dashboard Intuitivo**
   - Vista de documentos con estado
   - Interfaz responsiva con Bootstrap
   - Navegación clara

---

## 📋 Requisitos

- Python 3.9+
- pip (gestor de paquetes)

---

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/juancamilop06/RecoFacial.git
cd RecoFacial
```

### 2. Crear entorno virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus valores (principalmente para API keys de IA):
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
USE_MOCK_AI=true
```

### 5. Ejecutar la aplicación
```bash
python scripts/serve.py
```

La aplicación estará disponible en `http://localhost:8080`

---

## 📁 Estructura del Proyecto

```
SafeSign AI/
├── app/                          # Aplicación principal
│   ├── __init__.py              # Factory de Flask
│   ├── models/
│   │   ├── __init__.py
│   │   └── database.py          # Modelos SQLAlchemy
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py              # Rutas de login/registro
│   │   ├── documents.py         # Rutas de documentos
│   │   ├── biometry.py          # Rutas de verificación
│   │   └── signature.py         # Rutas de firma
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py              # Lógica de autenticación
│   │   ├── biometry.py          # Lógica biométrica
│   │   ├── document_processor.py # Procesamiento de PDFs
│   │   └── ai_analyzer.py       # Análisis con IA
│   ├── templates/               # Templates HTML
│   │   ├── base.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── upload.html
│   │   ├── document_view.html
│   │   ├── biometry_verify.html
│   │   ├── signature_pad.html
│   │   ├── signature_result.html
│   │   └── error.html
│   └── static/
│       ├── css/
│       │   └── style.css
│       └── js/
│           └── app.js
├── tests/                        # Tests unitarios
├── data/                         # Datos locales
│   ├── uploads/                 # PDFs subidos
│   ├── signatures/              # Firmas guardadas
│   └── capturas/                # Fotos de verificación
├── instance/                    # Instancia (BD SQLite)
│   └── safesign.db
├── scripts/                     # Entradas de ejecución
│   ├── run.py
│   └── serve.py
├── tools/
│   └── legacy/                  # Prototipo biométrico original
│       ├── verify.py
│       └── signature_server.py
├── requirements.txt             # Dependencias
├── .env.example                 # Variables de entorno
├── .gitignore                   # Git ignore
└── README.md                    # Esta documentación
```

---

## 📖 Flujo de Uso

### Usuario Nuevo
1. **Registro**: Crea cuenta con email y contraseña
2. **Dashboard**: Accede a tu área personal
3. **Subir**: Sube un documento PDF
4. **Análisis**: El sistema analiza automáticamente
5. **Ver**: Revisa resumen, obligaciones y riesgos
6. **Verificar**: Completa verificación biométrica
7. **Firmar**: Dibuja tu firma electrónica
8. **Listo**: Documento firmado y guardado

### Usuario Existente
1. **Login**: Inicia sesión
2. Accede a tus documentos anteriores
3. Puede seguir firmando documentos nuevos

---

## 🗄️ Base de Datos

### Modelos

#### User
```python
id (PK)
name: String
email: String (UNIQUE)
password_hash: String
created_at: DateTime
```

#### Document
```python
id (PK)
user_id (FK → User)
filename: String
filepath: String
contenido_texto: Text
resumen_ia: Text
riesgos: Text
obligaciones: Text
status: String (pendiente/firmado/rechazado)
created_at: DateTime
updated_at: DateTime
```

#### Signature
```python
id (PK)
user_id (FK → User)
document_id (FK → Document)
firma_imagen: String (ruta PNG)
firma_video: String (ruta WebM)
fecha_firma: DateTime
resultado_verificacion: String (VERDE/AMARILLO/ROJO)
notas: Text
```

#### BiometricVerification
```python
id (PK)
user_id (FK → User)
foto_referencia: String
foto_neutral: String
estado: String (pendiente/verificado/rechazado)
semaforo: String (VERDE/AMARILLO/ROJO)
movimiento_score: Float
distancia_facial: Float
intentos: Integer
created_at: DateTime
```

---

## 🔐 Seguridad

- Contraseñas hasheadas con Werkzeug
- Sesiones encriptadas con Flask-Login
- Rutas protegidas con @login_required
- CSRF protección (activable con WTForms)
- SQL Injection prevención (SQLAlchemy)
- Variables sensibles en .env (no en código)

---

## 🤖 IA y Análisis

### Modo Mock (Por defecto)
El análisis utiliza patrones regex y palabras clave:
- Detección de tipo de contrato
- Extracción de obligaciones
- Identificación de riesgos
- Extracción de puntos clave

**Activar**: `USE_MOCK_AI=true` en `.env`

### Modo Real (Preparado)
Para integrar OpenAI o Claude:
1. Obtén API key
2. Configura en `.env`:
   ```env
   USE_MOCK_AI=false
   OPENAI_API_KEY=sk-...
   # o
   CLAUDE_API_KEY=sk-ant-...
   ```
3. Implementa en `app/services/ai_analyzer.py`

---

## 🧪 Testing

### Ejecutar tests
```bash
pytest tests/
```

### Tests incluidos
- Autenticación (registro, login, validaciones)
- Documentos (subida, análisis)
- Biometría (verificación facial)
- Seguridad (rutas protegidas)

---

## 🚀 Próximas Mejoras

### Fase 2 (Escalabilidad)
- [ ] Soporte para múltiples formatos (Word, Excel)
- [ ] Almacenamiento en cloud (AWS S3, Azure Blob)
- [ ] API REST documentada (Swagger)
- [ ] Autenticación OAuth (Google, GitHub)
- [ ] Dashboard administrativo

### Fase 3 (IA Real)
- [ ] Integración OpenAI/Claude
- [ ] Análisis de claúsulas específicas
- [ ] Recomendaciones personalizadas
- [ ] Comparación de contratos

### Fase 4 (Producción)
- [ ] Migración a PostgreSQL
- [ ] Deployment (Docker, Heroku, AWS)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoreo y logging
- [ ] Backup automático

---

## 🤝 Contribuciones

¿Encontraste un bug o tienes una idea? 
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Agrega nueva-feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo licencia MIT - ver [LICENSE](LICENSE) para más detalles.

---

## 📧 Contacto

- **Autor**: Juan Camilo Prieto
- **GitHub**: [@juancamilop06](https://github.com/juancamilop06)
- **Proyecto**: [RecoFacial](https://github.com/juancamilop06/RecoFacial)

---

## 🎯 Hoja de Ruta

**MVP Actual (v0.1)**
- ✅ Autenticación
- ✅ Subida de documentos
- ✅ Análisis con IA (mock)
- ✅ Verificación biométrica con cámara
- ✅ Firma digital

**Próximo Release (v0.2)**
- [ ] Tests unitarios completos
- [ ] API REST
- [ ] Admin panel
- [ ] Exportación de reportes

**Versión 1.0**
- [ ] IA real integrada
- [ ] Producción ready
- [ ] Multi-idioma
- [ ] App móvil

Una red neuronal es un modelo de inteligencia artificial inspirado en el cerebro humano.

Está formada por muchas neuronas artificiales conectadas entre sí.

Estructura simplificada:

Entrada → capas ocultas → salida

Cada neurona realiza cálculos matemáticos sobre los datos.

Durante el entrenamiento la red aprende patrones viendo millones de ejemplos.

---

# Qué es ArcFace

ArcFace es un modelo de reconocimiento facial basado en deep learning.

Características:

- convierte rostros en vectores matemáticos
- usa distancia angular entre vectores
- tiene precisión muy alta (~99%)

ArcFace fue entrenado con millones de rostros para aprender a separar identidades.

---

# Requisitos

Python 3.9 o 3.10  
Webcam  
Windows / Linux / Mac

---

# Estructura del proyecto

PMC/

tools/legacy/verify.py  
requirements.txt  
data/  
id.jpg  
README.md

La imagen data/id.jpg es la foto de referencia.

---

# Crear el entorno virtual

Ir a la carpeta del proyecto:

```
cd D:\PMC
```

Crear entorno virtual:

```
python -m venv .venv
```

Activar entorno virtual:

```
.venv\Scripts\activate
```

Si está activo verás algo así:

```
(.venv) PS D:\PMC>
```

---

# Instalar dependencias

```
pip install -r requirements.txt
```

---

# Colocar imagen de referencia

Crear carpeta:

```
data
```

Dentro colocar:

```
data/id.jpg
```

Esta será la foto que el sistema usará para comparar.

---

# Ejecutar el programa

Ejecutar:

```
python tools/legacy/verify.py
```

La cámara se abrirá.

Controles:

SPACE → capturar y verificar rostro  
Q → salir  
ESC → salir  

---

# Ejemplo de uso

1. Coloca tu foto en data/id.jpg
2. Ejecuta el programa
3. Mira a la cámara
4. Presiona SPACE

Resultado posible:

MATCH ✔ dist=0.32

o

NO MATCH ✖ dist=0.65

---

# Problemas comunes

Error protobuf

Solución:

```
pip install protobuf==3.20.3
```

---

No se abre la cámara

Verifica que ninguna otra aplicación esté usando la webcam.

---

Espacio en disco insuficiente

TensorFlow es grande (~500MB).
Asegúrate de tener al menos 3GB libres.

---

# Librerías usadas

DeepFace → framework de reconocimiento facial  
TensorFlow → motor de redes neuronales  
OpenCV → manejo de cámara e imágenes  
RetinaFace → detector de rostros  
ArcFace → modelo de reconocimiento facial

---

# Licencia

Proyecto educativo.
