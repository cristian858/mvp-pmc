# 🚀 SafeSign AI - Docker Quick Reference

## Inicio Rápido (Copy-Paste)

```bash
cd /Users/cristian/Dev/pmc/ProyectoPMC
cp .env.docker .env
docker-compose build
docker-compose up -d
python3 verify_docker.py
```

Accede en: **http://localhost:5000**

---

## Comandos Esenciales

### Build
```bash
docker-compose build                    # Con caché
docker-compose build --no-cache         # Reconstruir todo
```

### Ciclo de Vida
```bash
docker-compose up -d                    # Iniciar (background)
docker-compose up                       # Iniciar (foreground, Ctrl+C para detener)
docker-compose down                     # Detener completamente
docker-compose restart safesign-backend # Reiniciar servicio
docker-compose pause                    # Pausar
docker-compose unpause                  # Reanudar
```

### Monitoreo
```bash
docker-compose logs -f                  # Logs en tiempo real (Ctrl+C para salir)
docker-compose logs --tail 50           # Últimas 50 líneas
docker ps                               # Ver contenedores activos
docker-compose ps                       # Ver servicios
docker stats                            # CPU/Memoria en uso
```

### Ejecución Remota
```bash
docker-compose exec safesign-backend bash          # Entrar a shell
docker-compose exec safesign-backend python        # Entrar a Python REPL
docker-compose exec safesign-backend python script.py  # Ejecutar script
docker-compose exec -T safesign-backend curl http://localhost:5000/  # Sin TTY
```

### Limpieza
```bash
docker-compose down                     # Detener sin borrar volúmenes
docker-compose down -v                  # Detener + eliminar volúmenes
docker system prune -f                  # Eliminar imágenes no usadas
docker image prune -f                   # Limiar imágenes
docker volume prune -f                  # Limpiar volúmenes
```

---

## Helper Scripts

### Bash Helper
```bash
./docker-helper.sh help          # Ver todos los comandos
./docker-helper.sh up            # Iniciar
./docker-helper.sh down          # Detener
./docker-helper.sh logs          # Ver logs
./docker-helper.sh shell         # Entrar a bash
./docker-helper.sh restart       # Reiniciar
./docker-helper.sh test          # Verificar dependencias
./docker-helper.sh status        # Ver estado
./docker-helper.sh clean         # Limpiar todo
```

### Makefile
```bash
make help                         # Ver comandos
make up                          # Iniciar
make down                        # Detener
make logs                        # Ver logs
make shell                       # Bash
make test                        # Verificar
make restart                     # Reiniciar
make clean                       # Limpiar
make status                      # Estado
make health                      # Health check
make version                     # Versiones instaladas
```

### Python Script
```bash
python3 verify_docker.py         # Verificación completa
```

---

## Verificación de Dependencias

```bash
# Dentro del contenedor (cualquiera de estos)
python -c "import cv2; print(cv2.__version__)"
python -c "import numpy; print(numpy.__version__)"
python -c "import flask; print(flask.__version__)"
python -c "import pandas; print(pandas.__version__)"

# O ejecutar script completo
docker-compose exec safesign-backend python3 verify_docker.py
```

---

## Acceso a la Aplicación

| Componente | URL |
|-----------|-----|
| Frontend | http://localhost:5000/ |
| Flask Debug | Habilitado en desarrollo |
| Logs | `docker-compose logs -f` |

---

## Base de Datos

```bash
# Acceder a SQLite
docker-compose exec safesign-backend sqlite3 instance/safesign.db

# Listar tablas
.tables

# Ver esquema
.schema

# Salir
.exit
```

---

## Variables de Entorno

Editar `.env`:
```env
FLASK_ENV=development           # Modo desarrollo/producción
FLASK_PORT=5000                # Puerto Flask
SECRET_KEY=...                 # Clave secreta
USE_MOCK_AI=true               # Usar mock (true) o API real (false)
OPENAI_API_KEY=                # Si usas OpenAI
CLAUDE_API_KEY=                # Si usas Claude
```

Cambios requieren: `docker-compose down && docker-compose up -d`

---

## Problemas Comunes

| Problema | Solución |
|----------|----------|
| Port 5000 usado | `FLASK_PORT=8000` en `.env` |
| "Cannot connect" | Esperar 30s, verificar `docker ps` |
| Import error | `docker-compose build --no-cache` |
| BD corrupta | Eliminar `instance/safesign.db` |
| Logs no aparecen | `docker-compose logs -f --all` |
| Contenedor lento | Normal primera vez (5-10 min de build) |

---

## Red y Puertos

```
Cliente (Tu Mac)
    ↓ :5000
Docker Network (bridge)
    ↓
Contenedor Flask
    ↓ :5000
Aplicación
```

Para cambiar puerto:
```bash
# En docker-compose.yml o .env
FLASK_PORT=8000

# Luego
docker-compose up -d
# Accede en http://localhost:8000
```

---

## Volúmenes Persistentes

```
Local                          Contenedor
data/uploads/          ←→      /app/data/uploads/
data/capturas/         ←→      /app/data/capturas/
data/signatures/       ←→      /app/data/signatures/
instance/              ←→      /app/instance/
```

Para resetear datos:
```bash
rm -rf data/uploads/* data/capturas/* data/signatures/*
rm instance/safesign.db
docker-compose restart
```

---

## Recursos

- CPU: Ilimitado (usa lo que necesita)
- RAM: Ilimitado (usa lo que necesita)
- Disco: ~1-2 GB para imagen + datos

Limitar recursos (en docker-compose.yml):
```yaml
services:
  safesign-backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Health Check

```bash
# Manual
curl http://localhost:5000/

# Automático (docker)
docker-compose exec -T safesign-backend curl http://localhost:5000/

# En logs
docker-compose logs | grep healthcheck
```

---

## Tips Productividad

### Alias en bash
```bash
# Agregar a ~/.zshrc o ~/.bashrc
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcshell='docker-compose exec safesign-backend bash'

# Luego
dcup    # en lugar de docker-compose up -d
dclogs  # en lugar de docker-compose logs -f
```

### Funciones útiles
```bash
# En ~/.zshrc
dcexec() { docker-compose exec safesign-backend "$@"; }
dcpython() { dcexec python -c "$@"; }

# Uso
dcpython "import cv2; print(cv2.__version__)"
```

---

## Limpieza Completa (PELIGRO)

```bash
# Detener y eliminar TODOEN incluyendo datos locales
docker-compose down -v
rm -rf data/ instance/

# Recriar desde cero
mkdir -p data/uploads data/capturas data/signatures instance
docker-compose build --no-cache
docker-compose up -d
```

---

## Información Técnica

**Python:** 3.11.15 (Debian Trixie)  
**Arquitectura:** arm64 (Apple Silicon compatible)  
**Base:** python:3.11-slim  
**Tamaño imagen:** ~800-900 MB  
**Tamaño contenedor:** ~100-200 MB RAM  

---

**¿Necesitas más ayuda?**  
- `DOCKER_GUIDE.md` - Documentación completa
- `DOCKER_SETUP.md` - Setup rápido
- `DOCKER_TEST.md` - Instrucciones de testing

**¡Keep shipping!** 🚀
