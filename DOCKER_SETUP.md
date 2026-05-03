# 🐳 SafeSign AI - Docker Setup Guide

## 📌 Resumen Rápido

Tu backend **SafeSign AI** ahora funciona perfectamente en Docker, optimizado para **Apple Silicon (M4 Mac)** y otros sistemas.

### ✨ Beneficios
- ✅ Todas las dependencias compiladas correctamente para tu arquitectura
- ✅ Tesseract OCR integrado
- ✅ OpenCV funcionando sin problemas en arm64
- ✅ NumPy, Pandas, PyPDF2 - todo pre-compilado
- ✅ Mismo entorno en desarrollo que en producción
- ✅ Sin contaminar tu Mac con dependencias de sistema

---

## 🚀 Inicio Rápido (5 minutos)

### 1️⃣ Verifica que tienes Docker Desktop instalado
```bash
docker --version
# Deberías ver algo como: Docker version 24.0.0+
```

Si no lo tienes: [Descarga Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2️⃣ Navega a la carpeta del proyecto
```bash
cd /Users/cristian/Dev/pmc/ProyectoPMC
```

### 3️⃣ Copia el archivo .env
```bash
cp .env.docker .env
# (O usa el .env.example existente)
```

### 4️⃣ Construye e inicia
```bash
# Primera vez: construir la imagen (5-10 minutos)
docker-compose build

# Iniciar el contenedor
docker-compose up -d
```

### 5️⃣ Accede a la aplicación
```
http://localhost:8080/
```

---

## 📚 Archivos que se crearon

```
ProyectoPMC/
├── Dockerfile                 ← Imagen Docker optimizada para arm64
├── docker-compose.yml         ← Configuración completa
├── .dockerignore             ← Qué archivos NO copiar
├── .env.docker               ← Variables de entorno ejemplo
├── DOCKER_GUIDE.md           ← Documentación detallada
├── docker-helper.sh          ← Script auxiliar (bash)
└── verify_docker.py          ← Script para verificar setup (python)
```

---

## 🛠️ Comandos Esenciales

### Usando el helper script (más fácil)
```bash
# Ver todos los comandos
./docker-helper.sh help

# Iniciar
./docker-helper.sh up

# Ver logs
./docker-helper.sh logs

# Entrar a bash
./docker-helper.sh shell

# Detener
./docker-helper.sh down

# Verificar dependencias
./docker-helper.sh test
```

### Usando docker-compose directamente
```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f safesign-backend

# Ejecutar comando
docker-compose exec safesign-backend bash
```

---

## ✅ Verificación

Después de `docker-compose up -d`, puedes verificar que todo funciona:

### Opción 1: Con el script Python
```bash
python3 verify_docker.py
```

### Opción 2: Manual
```bash
# Verificar que el contenedor está corriendo
docker ps | grep safesign

# Verificar dependencias
docker-compose exec safesign-backend python -c "import cv2; import flask; print('OK')"

# Acceder a la app
curl http://localhost:8080/
```

---

## 🔧 Problemas Comunes

### "Port 5000 already in use"
```bash
# Cambiar puerto en .env
FLASK_PORT=8000

# O liberar el puerto
lsof -i :5000
kill -9 <PID>
```

### "Cannot connect to Docker daemon"
Docker Desktop no está corriendo. Ábrelo desde **Applications > Docker.app**

### "Build fails"
```bash
# Reconstruir sin caché
docker-compose build --no-cache
```

### Datos no persisten
```bash
# Crear los directorios locales
mkdir -p data/uploads data/capturas data/signatures instance
docker-compose up -d
```

---

## 📖 Documentación Completa

Para más detalles:
- **DOCKER_GUIDE.md** - Guía completa con troubleshooting
- **docker-helper.sh** - Comentarios en el script

---

## 🎯 Próximos Pasos

Una vez que Docker funciona:

1. **API REST** - Refactorizar rutas a endpoints JSON
2. **Frontend React** - Crear interfaz moderna con Tailwind
3. **Deploy** - Preparar para producción

---

## 📞 Support

Si tienes problemas específicos:

1. Verifica los logs: `docker-compose logs safesign-backend`
2. Intenta reconstruir: `docker-compose build --no-cache`
3. Limpia todo: `docker-compose down -v`

¡Happy coding! 🚀
