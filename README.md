# SafeSign AI - Plataforma de Firma Digital Inteligente

Una aplicación web moderna para firmar documentos de forma segura utilizando inteligencia artificial, verificación biométrica y reconocimiento facial.

## Características Principales

### Funcionalidades Implementadas

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
   - Modo Mock (análisis con regex) por defecto
   - Preparado para integración con OpenAI/Claude API

4. **Verificación Biométrica**
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

7. **API REST v1**
   - Endpoints JSON para todas las operaciones
   - Autenticación basada en sesiones
   - Soporte para paginación
   - Documentación completa con ejemplos
   - Base lista para integración con frontend moderno (React, Vue, etc.)

## Descripción General

SafeSign AI es una plataforma moderna de firma digital con análisis inteligente de documentos, verificación biométrica y reconocimiento facial. El proyecto incluye un backend Flask robusto y un frontend React responsivo.

Una aplicación web completa para:
- Firmar documentos de forma segura y legal
- Analizar contratos automáticamente con IA para identificar riesgos y obligaciones
- Verificar identidad mediante reconocimiento facial y biometría
- Gestionar documentos de forma centralizada y segura

## Características Técnicas

### Backend (Flask)
- API REST JSON completamente funcional
- Autenticación segura con sesiones encriptadas
- Análisis de documentos PDF con IA (modo mock por defecto)
- Verificación biométrica con cámara web
- Base de datos SQLAlchemy con modelos robustos
- Almacenamiento seguro de firmas y datos sensibles
- Soporte para Docker

### Frontend (React)
- Interfaz moderna y responsiva con Vite
- Componentes reutilizables y bien organizados
- Iconografía vectorial centralizada y estandarizada
- Integración completa con API backend
- Gestión de estado centralizada
- Diseño accesible y profesional

## Estructura del Proyecto

```
mvp-pmc/
├── README.md              # Esta documentación
├── LICENSE                # Licencia CC BY-NC 4.0
├── .gitignore            # Configuración de git
│
├── backend/              # Aplicación Flask
│   ├── README.md         # Documentación específica del backend
│   ├── app/              # Código fuente (routes, services, models)
│   ├── scripts/          # Entry points (serve.py, run.py)
│   ├── Dockerfile        # Configuración Docker
│   ├── docker-compose.yml # Orquestación de servicios
│   ├── Makefile          # Comandos útiles
│   ├── requirements.txt   # Dependencias Python
│   ├── data/             # Datos locales (uploads, signatures, capturas)
│   └── instance/         # Base de datos SQLite
│
└── frontend/             # Aplicación React + Vite
    ├── README.md         # Documentación específica del frontend
    ├── src/              # Código fuente (components, pages, services)
    ├── public/           # Archivos estáticos
    ├── package.json      # Dependencias Node.js
    ├── vite.config.js    # Configuración Vite
    └── dist/             # Build producción
```

## Quick Start

### Prerequisitos Globales
- Python 3.9+ (para backend)
- Node.js 18+ (para frontend)
- Docker & Docker Compose (opcional, recomendado)

### Opción 1: Ejecución Local (Sin Docker)

#### Backend
```bash
cd backend/

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env

# Ejecutar servidor
python scripts/serve.py
```
Disponible en `http://localhost:8080`

#### Frontend
```bash
cd frontend/

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```
Disponible en `http://localhost:5173`

### Opción 2: Ejecución con Docker (Recomendado)

```bash
cd backend/

# Construir imagen
docker-compose build

# Iniciar contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f safesign-backend
```
Disponible en `http://localhost:8080`

Frontend se puede ejecutar localmente:
```bash
cd frontend/
npm install
npm run dev
```

## Flujo Principal

1. Registro/Login - El usuario se registra o inicia sesión
2. Subir Documento - Sube un archivo PDF para firmar
3. Análisis Automático - El sistema analiza con IA el contenido
4. Ver Análisis - Revisa resumen, obligaciones y riesgos
5. Verificación Biométrica - Completa reconocimiento facial (cámara web)
6. Firmar - Dibuja su firma electrónica
7. Completado - Documento firmado y guardado

## Documentación Detallada

- [Backend](./backend/README.md) - Instalación, API endpoints, base de datos, seguridad
- [Frontend](./frontend/README.md) - Setup React, componentes, estructura

## Tecnologías Utilizadas

### Backend
- Flask (framework web)
- SQLAlchemy (ORM de base de datos)
- PyPDF2 (procesamiento de PDFs)
- OpenCV (procesamiento de imágenes y cámara)
- Flask-Login (autenticación)
- Werkzeug (hashing de contraseñas)
- Docker (contenedorización)

### Frontend
- React 18 (framework UI)
- Vite (bundler moderno)
- Tailwind CSS (estilos)
- JavaScript ES6+

## Variables de Entorno

Crear `.env` en la raíz del backend (ver `.env.example`):

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
USE_MOCK_AI=true
DATABASE_URL=sqlite:///instance/safesign.db
FLASK_PORT=8080
```

## Licencia

Este proyecto está bajo licencia **Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)**.

Resumen:
- Permitido: Usar, modificar, distribuir para fines no comerciales con atribución
- Prohibido: Uso comercial, venta, o lucro del proyecto o sus derivadas
- Requerido: Incluir licencia y atribución original

Ver [LICENSE](./LICENSE) para el texto completo.

## Contribuciones

Las contribuciones son bienvenidas bajo la misma licencia:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Agrega nueva-feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## Próximas Mejoras

- Integración real con OpenAI/Claude API
- Soporte para múltiples formatos (Word, Excel, etc.)
- Almacenamiento en cloud (AWS S3, Azure Blob)
- Dashboard administrativo
- Autenticación OAuth (Google, GitHub)
- App móvil
- Migración a PostgreSQL para producción
- Deployment automatizado

## Roadmap

**MVP Actual (v0.1 - COMPLETADO)**
- Autenticación con sesiones
- Subida y procesamiento de PDFs
- Análisis con IA (mock)
- Verificación biométrica
- Firma digital
- API REST funcional

**Próximo Release (v0.2)**
- Tests unitarios completos
- Panel de administración
- Exportación de reportes

**Versión 1.0**
- IA real integrada
- Producción-ready
- Multi-idioma
- App móvil

## Troubleshooting

### Backend no inicia
```bash
# Limpiar cache Python
find . -type d -name __pycache__ -exec rm -r {} +
pip install -r requirements.txt --force-reinstall
```

### Puerto 8080 en uso
Cambiar en `backend/scripts/serve.py` o `backend/docker-compose.yml`

### Problemas con cámara web
- En Docker: ejecutar frontend localmente
- En local: verificar permisos del navegador
- En macOS: permitir acceso a cámara en Preferencias > Seguridad

### Base de datos corrupta
```bash
cd backend/
rm instance/safesign.db
python scripts/serve.py  # Se recrea automáticamente
```

## Contacto y Soporte

Para reportar bugs o sugerencias:
- Abre un issue en el repositorio
- Revisa la documentación detallada en cada carpeta

---

Hecho con dedicación para seguridad digital. SafeSign AI MVP 2026.
