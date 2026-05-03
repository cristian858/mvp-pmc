# 🐳 SafeSign AI - Guía Docker para Apple Silicon (M4 Mac)

## 📋 Introducción

Este Dockerfile está **optimizado para Apple Silicon (arm64)** y también funciona en arquitecturas x86_64. Resuelve todos los problemas de compatibilidad con TensorFlow, OpenCV y otras librerías C++.

### ¿Por qué Docker?
- ✅ Eliminates "It works on my machine" problems
- ✅ Mismo entorno en desarrollo y producción
- ✅ Pre-compilado todo dentro del contenedor
- ✅ No requiere instalar dependencias de sistema en tu Mac
- ✅ Aislamiento total de tu sistema

---

## 🚀 Quick Start (5 minutos)

### 1. Requisitos previos
```bash
# Instalar Docker Desktop (gratuito)
# https://www.docker.com/products/docker-desktop/

# Verificar que Docker está instalado
docker --version
# Docker version 24.0.0+ (cualquier versión reciente está bien)
```

### 2. Clonar/Navegar al proyecto
```bash
cd /Users/cristian/Dev/pmc/ProyectoPMC
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env
# o si prefieres usar el archivo Docker
cp .env.docker .env

# Editar si es necesario (opcional para desarrollo)
nano .env
```

### 4. Build y ejecutar
```bash
# Primera vez: construir la imagen (toma 5-10 min)
docker-compose build

# Ejecutar el contenedor
docker-compose up -d

# Verificar que está corriendo
docker ps
# Deberías ver "safesign-backend" corriendo
```

### 5. Acceder a la aplicación
```
http://localhost:5000/
```

### 6. Ver logs
```bash
# Ver logs en tiempo real
docker-compose logs -f safesign-backend

# Ver últimas 50 líneas
docker-compose logs --tail 50 safesign-backend
```

---

## 🔧 Comandos Útiles

### Detener la aplicación
```bash
docker-compose down
```

### Reiniciar
```bash
docker-compose restart safesign-backend
```

### Ejecutar comando dentro del contenedor
```bash
# Entrar a una shell bash
docker-compose exec safesign-backend bash

# Ejecutar comando específico
docker-compose exec safesign-backend python -c "import cv2; print(cv2.__version__)"
```

### Limpiar todo (CUIDADO: elimina la BD local)
```bash
# Detener e eliminar contenedores
docker-compose down -v

# Eliminar imagen compilada
docker image rm safesign-backend:latest
```

### Reconstruir después de cambios en requirements
```bash
# Si agreguaste nuevas dependencias a requirements.txt:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Verificación de Dependencias

Una vez que el contenedor esté corriendo, verifica que todo está instalado correctamente:

```bash
# Dentro del contenedor
docker-compose exec safesign-backend python -c "
import sys
print('Python:', sys.version)

try:
    import cv2
    print('✓ OpenCV:', cv2.__version__)
except ImportError as e:
    print('✗ OpenCV:', e)

try:
    import pytesseract
    print('✓ Pytesseract:', pytesseract.__version__)
except ImportError as e:
    print('✗ Pytesseract:', e)

try:
    import numpy
    print('✓ NumPy:', numpy.__version__)
except ImportError as e:
    print('✗ NumPy:', e)

try:
    import pandas
    print('✓ Pandas:', pandas.__version__)
except ImportError as e:
    print('✗ Pandas:', e)
"
```

---

## 🔌 Estructura de Volúmenes

El contenedor mapea estos directorios de tu Mac al contenedor:

```
Tu Mac                          →    Contenedor
data/uploads/                   →    /app/data/uploads/
data/capturas/                  →    /app/data/capturas/
data/signatures/                →    /app/data/signatures/
instance/                       →    /app/instance/  (BD SQLite)
```

**Nota:** Los archivos guardados en estos directorios persisten incluso si el contenedor se detiene.

---

## ⚙️ Configuración Avanzada

### Cambiar Puerto
```bash
# En .env
FLASK_PORT=8000

# O en línea de comandos
FLASK_PORT=8000 docker-compose up -d
```

### Usar PostgreSQL en lugar de SQLite
```bash
# En .env
DATABASE_URL=postgresql://safesign:password@postgres:5432/safesign_db

# Agregar a docker-compose.yml:
# postgres:
#   image: postgres:15-alpine
#   environment:
#     POSTGRES_DB: safesign_db
#     POSTGRES_USER: safesign
#     POSTGRES_PASSWORD: password
```

### Integrar OpenAI/Claude
```bash
# En .env
USE_MOCK_AI=false
OPENAI_API_KEY=sk-your-key-here
# o
CLAUDE_API_KEY=sk-ant-your-key-here
```

### Modo Producción
```bash
# En .env
FLASK_ENV=production
SECRET_KEY=truly-random-secret-key-here
```

---

## 🔍 Troubleshooting

### "Port 5000 already in use"
```bash
# Cambiar puerto en .env
FLASK_PORT=5001

# O liberar el puerto
lsof -i :5000
kill -9 <PID>
```

### "Cannot connect to Docker daemon"
```bash
# Docker Desktop no está corriendo
# Abrirlo desde Applications > Docker.app
```

### Build falla con errores de compilación
```bash
# Reconstruir desde cero (sin caché)
docker-compose build --no-cache
```

### Volúmenes no persisten
```bash
# Verificar que existen los directorios locales
mkdir -p data/uploads data/capturas data/signatures instance

# Reintentar
docker-compose up -d
```

### Contenedor sale inmediatamente
```bash
# Ver error detallado
docker-compose logs safesign-backend

# Si hay error de importación, reconstruir
docker-compose build --no-cache
```

---

## 🔐 Seguridad en Producción

Para deployar a producción:

1. **Cambiar SECRET_KEY** a algo realmente aleatorio
2. **Cambiar FLASK_ENV** a `production`
3. **Usar PostgreSQL** en lugar de SQLite
4. **Usar HTTPS** con reverse proxy (nginx)
5. **Limitar CORS** a dominio específico
6. **No incluir `.env`** en Git (agregar a `.gitignore`)

Ejemplo `docker-compose.prod.yml`:
```yaml
services:
  safesign-backend:
    build: .
    environment:
      FLASK_ENV: production
      SECRET_KEY: ${SECRET_KEY}  # Variable secreto en CI/CD
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
    restart: always
    networks:
      - safesign-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: safesign_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: always
    networks:
      - safesign-network
```

---

## 📚 Referencia Completa

### Arquitectura soportadas
- ✅ `linux/arm64` - Apple Silicon M1/M2/M3/M4
- ✅ `linux/amd64` - Intel/AMD, Linux, Windows WSL2
- ✅ `linux/arm/v7` - Raspberry Pi, ARM antiguo

### Versiones de software
- Python 3.11 (optimizado, rápido, estable)
- NumPy con soporte arm64
- OpenCV pre-compilado
- Tesseract OCR integrado
- Todas las dependencias en requirements-minimal.txt

---

## 🤝 Soporte

Si encuentras problemas específicos de tu Mac M4:

1. Ejecuta este comando y guarda la salida:
```bash
docker-compose exec safesign-backend python -c "import platform; print(platform.platform())"
```

2. Verifica que tienes al menos 4GB de RAM libres
3. Reinicia Docker Desktop si hay problemas persistentes

---

**¡Listo! Ya tienes SafeSign AI corriendo en Docker en tu M4 Mac.** 🚀
