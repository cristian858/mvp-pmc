# SafeSign AI - Backend

Backend de una plataforma moderna de firma digital con análisis de documentos inteligente, verificación biométrica y reconocimiento facial.

## Características Principales

### Implementadas
- **Autenticación Segura**: Registro, login con hash de contraseñas (Werkzeug), sesiones con Flask-Login
- **Gestión de Documentos**: Subida de PDF, extracción de texto con PyPDF2, almacenamiento seguro
- **Análisis Inteligente con IA**: Análisis automático de contratos, resúmenes, identificación de obligaciones, detección de riesgos (modo mock por defecto, preparado para OpenAI/Claude)
- **Verificación Biométrica**: Verificación facial con cámara (OpenCV), detección de movimiento (Liveness Detection), sistema de semáforos (VERDE/AMARILLO/ROJO)
- **Firma Digital**: Lienzo interactivo, almacenamiento seguro con metadatos
- **Dashboard**: Vista de documentos con estado, interfaz responsiva
- **API REST v1**: Endpoints JSON para todas las operaciones, autenticación por sesiones, paginación, documentación completa

## Quick Start

### Requisitos Previos
- Python 3.9+
- pip
- Docker (opcional, recomendado para M4 Mac)

### Instalación Local

```bash
# 1. Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# o en Windows:
# venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores (principalmente API keys si usas OpenAI/Claude)

# 4. Ejecutar la aplicación
python scripts/serve.py
```

La aplicación estará disponible en `http://localhost:8080`

### Usando Docker

```bash
# Construir imagen
docker-compose build

# Iniciar contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f safesign-backend

# Ejecutar comandos dentro del contenedor
docker-compose exec safesign-backend bash
```

### Comandos útiles

```bash
make build          # Construir imagen Docker
make up             # Iniciar contenedor
make down           # Detener contenedor
make logs           # Ver logs en vivo
make shell          # Entrar a bash en el contenedor
make restart        # Reiniciar contenedor
make test           # Verificar dependencias (verify_docker.py)
make clean          # Limpiar volúmenes (cuidado: elimina datos)
make db-reset       # Reiniciar base de datos
make health         # Verificar salud de la aplicación
```

## Estructura del Proyecto

```
backend/
├── app/                          # Aplicación Flask principal
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
│   ├── templates/               # Templates HTML (legacy)
│   └── static/                  # Archivos CSS/JS (legacy)
├── scripts/
│   ├── serve.py                 # Entry point principal
│   └── run.py                   # Entry point alternativo
├── tools/legacy/                # Prototipo biométrico original
├── data/                        # Datos locales (no se suben a git)
│   ├── uploads/                 # PDFs subidos
│   ├── signatures/              # Firmas guardadas
│   └── capturas/                # Fotos de verificación
├── instance/                    # Instancia SQLite (no se sube a git)
├── Dockerfile                   # Configuración Docker
├── docker-compose.yml           # Orquestación de servicios
├── Makefile                     # Comandos de desarrollo
├── requirements.txt             # Dependencias Python
├── .env.example                 # Plantilla de variables de entorno
└── README.md                    # Esta documentación
```

## Flujo de Uso

### Usuario Nuevo
1. Registro con email/contraseña
2. Login al dashboard
3. Subir documento PDF
4. Sistema analiza automáticamente con IA
5. Ver resumen, obligaciones y riesgos
6. Completar verificación biométrica
7. Dibujar firma electrónica
8. Documento firmado y guardado

### Endpoints API Principales

**Base URL**: `http://localhost:8080/api/v1`

#### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/logout` - Cerrar sesión

#### Documentos
- `GET /documents?page=1&per_page=10` - Listar documentos del usuario
- `POST /documents` - Subir y analizar documento
- `GET /documents/{id}` - Obtener detalles del documento
- `PATCH /documents/{id}/status` - Actualizar estado (pendiente/firmado/rechazado)

#### Firmas
- `POST /signatures/document/{document_id}/create` - Crear firma
- `GET /signatures/{id}` - Obtener datos de firma

#### Biometría
- `POST /biometry/verify` - Verificación facial

## Base de Datos

### Modelos SQLAlchemy

#### User
```
id (PK)
name: String
email: String (UNIQUE)
password_hash: String
created_at: DateTime
```

#### Document
```
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
```
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
```
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

## Configuración de Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
FLASK_PORT=8080

# Base de datos
DATABASE_URL=sqlite:////app/instance/safesign.db

# Biometría
UMBRAL_MOVIMIENTO=0.03
TESSERACT_CMD=/usr/bin/tesseract

# IA
USE_MOCK_AI=true                    # Por defecto: análisis mock (regex)
OPENAI_API_KEY=sk-...              # Opcional: para usar OpenAI
CLAUDE_API_KEY=sk-ant-...          # Opcional: para usar Claude
```

## IA y Análisis

### Modo Mock (Por defecto)
El análisis utiliza patrones regex y palabras clave para:
- Detectar tipo de contrato
- Extraer obligaciones
- Identificar riesgos
- Extraer puntos clave

Activado por defecto. Funciona sin API keys.

### Modo Real
Para integrar OpenAI o Claude:
1. Obtén API key de OpenAI o Anthropic
2. Configura en `.env`
3. Edita `app/services/ai_analyzer.py` para implementar los llamados a la API

## Seguridad

- Contraseñas hasheadas con Werkzeug
- Sesiones encriptadas con Flask-Login
- Rutas protegidas con decorador @login_required
- CSRF protección (activable con WTForms)
- SQL Injection prevención (SQLAlchemy)
- Variables sensibles en .env (nunca en código)
- Validación de entrada en todos los endpoints

## Desarrollo

### Ejecutar tests
```bash
pytest tests/
```

### Ver estructura de la BD
```bash
python -c "from app import db, create_app; app = create_app(); print(db.metadata.tables.keys())"
```

### Verificar dependencias
```bash
python verify_docker.py
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"
```bash
pip install -r requirements.txt --force-reinstall
```

### "Port 8080 already in use"
Cambiar puerto en `docker-compose.yml` (línea 16: `FLASK_PORT`) o en `scripts/serve.py`

### "BD corrupta"
```bash
rm instance/safesign.db
python scripts/serve.py  # Se recrea automáticamente
```

### Cámara no funciona en Docker
En macOS, necesitas permisos de cámara. Considera ejecutar localmente para desarrollo biométrico.

## Próximas Mejoras

- Soporte para múltiples formatos (Word, Excel)
- Almacenamiento en cloud (AWS S3, Azure Blob)
- Integración OAuth (Google, GitHub)
- Dashboard administrativo
- Análisis avanzado con IA real (OpenAI/Claude)
- Migración a PostgreSQL para producción
- Deployment a cloud (Docker, Heroku, AWS)
- CI/CD con GitHub Actions

## Licencia

Este proyecto está bajo licencia CC BY-NC 4.0 (Creative Commons Attribution-NonCommercial).
Uso no comercial permitido. Ver LICENSE para más detalles.

## Contacto y Contribuciones

Para bugs, sugerencias o contribuciones:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Agrega nueva-feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request
