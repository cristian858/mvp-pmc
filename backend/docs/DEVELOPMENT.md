# Development Guide

Guía para desarrollo local sin Docker.

## Quick Start (10 minutos)

### 1. Requisitos

- Python 3.9+
- pip (gestor de paquetes)
- Webcam (para biometría, opcional)

### 2. Setup

```bash
# Entrar a la carpeta backend
cd backend

# Crear entorno virtual
python3 -m venv venv

# Activar entorno
source venv/bin/activate
# En Windows:
# venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar Variables

```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus valores
nano .env
```

### 4. Ejecutar

```bash
# Iniciar servidor
python scripts/serve.py

# O alternativo:
python scripts/run.py
```

La aplicación estará en: http://localhost:8080

### 5. Parar

Presionar `Ctrl+C` en la terminal.

## Estructura del Proyecto

```
backend/
├── app/                   # Aplicación Flask
│   ├── __init__.py       # Factory
│   ├── models/           # Modelos de BD
│   ├── routes/           # Rutas HTTP
│   ├── services/         # Lógica de negocio
│   ├── templates/        # HTML (legacy)
│   └── static/           # CSS/JS (legacy)
├── scripts/
│   ├── serve.py          # Entry point principal
│   └── run.py            # Entry point alternativo
├── tests/                # Tests unitarios
│   └── test_api.py       # Tests de API
├── tools/legacy/         # Código legacy
├── data/                 # Almacenamiento local
│   ├── uploads/          # PDFs
│   ├── signatures/       # Firmas
│   └── capturas/         # Fotos
├── instance/             # BD SQLite
├── requirements.txt      # Dependencias
├── README.md            # Documentación general
└── docs/                # Documentación específica
    ├── DOCKER.md        # Docker setup
    ├── DEVELOPMENT.md   # Este archivo
    ├── API.md           # Referencia API
    └── DEPLOYMENT.md    # Deploy
```

## Desarrollo Diario

### Editar código

El servidor puede recargar automáticamente si editas archivos:

```bash
# En .env, asegurar que está en development
FLASK_ENV=development
```

Algunos cambios requieren reiniciar el servidor (cambios en rutas, modelos, etc.).

### Ejecutar tests

```bash
# Ejecutar suite de tests API
python tests/test_api.py

# O con pytest si lo prefieres:
pip install pytest
pytest tests/
```

### Interactuar con la BD

```bash
# Entrar a Python shell
python

# Importar modelos
from app import db, create_app
from app.models import User, Document

app = create_app()
with app.app_context():
    users = User.query.all()
    print(users)
```

### Ver logs

Los logs se escriben en archivos dentro de la carpeta si está configurada:
```bash
tail -f server.log  # Ver logs en vivo
```

## Debugging

### Usar debugger

En `scripts/serve.py`:
```python
if __name__ == '__main__':
    # Debug mode
    app.run(debug=True, port=8080)
```

Con `debug=True`:
- El servidor recarga automáticamente
- Puedes ver errores en el navegador
- Puedes usar el debugger interactivo

### Logs detallados

En `.env`:
```env
FLASK_ENV=development
FLASK_DEBUG=1  # Habilitar debug
LOG_LEVEL=DEBUG
```

## Dependencias

### Dependencias Principales

```
Flask==3.1.3              # Framework web
SQLAlchemy==2.0          # ORM base de datos
PyPDF2==4.0.1            # Lectura de PDFs
OpenCV==4.9.0            # Procesamiento de imágenes
Flask-Login==0.6.3       # Autenticación
Werkzeug==3.0.1          # Hashing de contraseñas
```

### Instalar nuevas dependencias

```bash
# Instalar
pip install nombre-paquete

# Congelar lista
pip freeze > requirements.txt
```

## Troubleshooting

### ModuleNotFoundError

```bash
# Asegurar que el entorno está activado
source venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Puerto 8080 en uso

```bash
# Cambiar en scripts/serve.py
app.run(port=9000)

# O en línea de comandos
python scripts/serve.py --port 9000
```

### BD corrupta

```bash
# Eliminar BD
rm instance/safesign.db

# Se recreará automáticamente
python scripts/serve.py
```

### Errores de permiso en Linux/Mac

```bash
# Si scripts no tienen permisos
chmod +x scripts/*.py

# Si problemas con puertos bajos
sudo python scripts/serve.py
```

## Frontend Development

Para desarrollar el frontend mientras trabajas en el backend:

Terminal 1 (Backend):
```bash
cd backend
python scripts/serve.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

Ambas aplicaciones correrán en paralelo.

## Documentación API

Ver [API.md](API.md) para referencia de endpoints.

## Deploy a Producción

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones.
