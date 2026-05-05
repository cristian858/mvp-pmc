# SafeSign AI - Dockerfile optimizado para Apple Silicon (M4) y otras arquitecturas
# Soporta: linux/amd64, linux/arm64 (incluyendo Apple Silicon)

# Stage 1: Builder - Compilar dependencias C++ pesadas
FROM python:3.11-slim AS builder

# Instalar herramientas de compilación (Debian Trixie compatible)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    git \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio virtual de dependencias
WORKDIR /tmp/build
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Actualizar pip, setuptools y wheel
RUN pip install --upgrade pip setuptools wheel

# Copiar requirements y pre-compilar dependencias
COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

# ---

# Stage 2: Runtime - Imagen final optimizada
FROM python:3.11-slim AS runtime

# Metadata
LABEL maintainer="SafeSign AI Team"
LABEL description="SafeSign AI - Plataforma de Firma Digital Inteligente para Apple Silicon y x86"

# Instalar dependencias del sistema necesarias (pero NO herramientas de compilación)
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Para OpenCV
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    # Para Tesseract OCR
    tesseract-ocr \
    # Utilidades generales
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar ambiente virtual pre-compilado del builder
COPY --from=builder /opt/venv /opt/venv

# Configurar PATH para usar el venv
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Crear usuario no-root por seguridad
RUN useradd -m -u 1000 safesign && \
    mkdir -p /app /app/data /app/instance && \
    chown -R safesign:safesign /app

WORKDIR /app

# Copiar código de la aplicación
COPY --chown=safesign:safesign . .

# Instalar dependencias adicionales (si existen en requirements.txt original)
# Primero intentamos con requirements-docker.txt, sino con requirements-minimal.txt
RUN if [ -f requirements-docker.txt ]; then \
      pip install --no-cache-dir -r requirements-docker.txt; \
    elif [ -f requirements-minimal.txt ]; then \
      pip install --no-cache-dir -r requirements-minimal.txt; \
    fi

# Crear directorios de datos necesarios
RUN mkdir -p /app/data/uploads \
    /app/data/capturas \
    /app/data/signatures \
    && chown -R safesign:safesign /app/data

# Cambiar a usuario no-root
USER safesign

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Exponer puerto Flask
EXPOSE 8080

# Variables de entorno por defecto (pueden ser overrideadas)
ENV FLASK_APP=scripts/serve.py \
    FLASK_ENV=development \
    USE_MOCK_AI=true

# Comando por defecto: ejecutar la aplicación
CMD ["python", "scripts/serve.py"]
