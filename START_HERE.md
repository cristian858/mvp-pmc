# 🚀 START HERE - SafeSign AI Docker

## ¿Completamente nuevo?

1. **Leer 5 minutos:** `DOCKER_SETUP.md`
2. **Ejecutar 10 minutos:** Los comandos abajo
3. **Acceder:** http://localhost:8080/

## Comandos Rápidos

```bash
# Entrar a la carpeta
cd /Users/cristian/Dev/pmc/ProyectoPMC

# Copiar configuración
cp .env.docker .env

# Construir (primera vez: 5-10 minutos)
docker-compose build

# Iniciar
docker-compose up -d

# Verificar que funciona
python3 verify_docker.py

# Si todo está bien, accede en:
# http://localhost:8080/
```

## ¿Algo no funciona?

```bash
# Ver logs
docker-compose logs -f

# Reconstruir
docker-compose build --no-cache

# Limpiar todo
docker-compose down -v
mkdir -p data/uploads data/capturas data/signatures instance
docker-compose build && docker-compose up -d
```

## Documentación

- **Rápido:** DOCKER_SETUP.md
- **Completo:** DOCKER_GUIDE.md
- **Testing:** DOCKER_TEST.md
- **Comandos:** DOCKER_QUICK_REF.md

## Helper Fácil

```bash
./docker-helper.sh help      # Ver opciones
./docker-helper.sh up        # Iniciar
./docker-helper.sh down      # Detener
./docker-helper.sh logs      # Ver logs
./docker-helper.sh shell     # Entrar a bash
```

**¡Eso es! Tu Docker está listo.** ✅
