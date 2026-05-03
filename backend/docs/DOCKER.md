# Docker Setup Guide

Guía completa para ejecutar SafeSign AI con Docker.

## Quick Start (5 minutos)

### 1. Requisitos

- Docker Desktop instalado
- Docker Compose (incluido en Docker Desktop)

### 2. Iniciar

```bash
# Entrar a la carpeta backend
cd backend

# Construir imagen (primera vez, 5-10 minutos)
docker-compose build

# Iniciar contenedor
docker-compose up -d

# Verificar que funciona
docker-compose ps
```

La aplicación estará en: http://localhost:8080

### 3. Parar el Proyecto

Opción 1 (recomendada):
```bash
make down
```

Opción 2:
```bash
./docker-helper.sh down
```

Opción 3:
```bash
docker-compose down
```

## Comandos Útiles

### Usando Makefile

```bash
# Iniciar
make up

# Ver logs
make logs

# Parar (importante)
make down
make stop    # alias para down

# Reiniciar
make restart

# Acceso a bash
make shell

# Verificar dependencias
make test

# Ver estado
make status

# Limpiar volúmenes
make clean
```

### Usando docker-helper.sh

```bash
# Iniciar
./docker-helper.sh up

# Ver logs
./docker-helper.sh logs

# Parar (importante)
./docker-helper.sh down
./docker-helper.sh stop   # alias para down

# Reiniciar
./docker-helper.sh restart

# Acceso a bash
./docker-helper.sh shell

# Verificar dependencias
./docker-helper.sh test

# Limpiar volúmenes
./docker-helper.sh clean
```

### Usando docker-compose directamente

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f safesign-backend

# Parar (importante)
docker-compose down

# Reiniciar
docker-compose restart safesign-backend

# Acceso a bash
docker-compose exec safesign-backend bash

# Ver estado
docker-compose ps
```

## Archivos Importantes

- **Dockerfile** - Imagen Docker optimizada para Apple Silicon
- **docker-compose.yml** - Configuración de servicios
- **.env.docker** - Plantilla de variables de entorno
- **docker-helper.sh** - Script helper con colores
- **verify_docker.py** - Verificador de dependencias
- **Makefile** - Comandos cortos

## Configuración

### Variables de Entorno

Crear `.env` desde la plantilla:
```bash
cp .env.docker .env
```

Editar `.env` con tus valores:
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
USE_MOCK_AI=true
FLASK_PORT=8080
```

### Puertos

- **8080** - API Backend (por defecto)
- Cambiar en docker-compose.yml si es necesario

## Troubleshooting

### El contenedor no inicia

```bash
# Ver logs de error
docker-compose logs safesign-backend

# Reconstruir sin caché
docker-compose build --no-cache
docker-compose up -d
```

### Puerto 8080 en uso

Cambiar puerto en docker-compose.yml:
```yaml
ports:
  - "9000:8080"  # Cambiar a 9000
```

### Permiso denegado en docker-helper.sh

```bash
chmod +x docker-helper.sh
```

### Limpiar completamente

```bash
# Parar contenedor y eliminar volúmenes
docker-compose down -v

# Eliminar imagen
docker rmi safesign-backend:latest

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up -d
```

## Desarrollo Local sin Docker

Si prefieres no usar Docker, ver [DEVELOPMENT.md](DEVELOPMENT.md).

## Deployment a Producción

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones de deploy.
