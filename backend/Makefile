.PHONY: help build up down stop logs shell restart clean test

# SafeSign AI - Makefile
# Proporciona comandos cortos para operaciones comunes
# Para detener el proyecto: make down (o make stop)

help:
	@echo "SafeSign AI - Backend Commands"
	@echo "========================================"
	@echo ""
	@echo "INICIAR Y PARAR:"
	@echo "  make up              Iniciar contenedor"
	@echo "  make down            Detener contenedor (recomendado)"
	@echo "  make stop            Alias para detener (mismo que down)"
	@echo ""
	@echo "DESARROLLO:"
	@echo "  make build           Construir imagen"
	@echo "  make build-nc        Construir sin caché"
	@echo "  make restart         Reiniciar contenedor"
	@echo "  make logs            Ver logs en vivo"
	@echo "  make shell           Entrar a bash"
	@echo ""
	@echo "VERIFICACIÓN:"
	@echo "  make test            Verificar dependencias Docker"
	@echo "  make status          Ver estado de contenedores"
	@echo "  make health          Verificar salud de la app"
	@echo ""
	@echo "LIMPIEZA:"
	@echo "  make clean           Limpiar volúmenes (cuidado!)"
	@echo "  make prune           Limpiar sistema Docker"
	@echo ""
	@echo "Ejemplo: make up && make logs"
	@echo "Para parar: make down"

build:
	docker-compose build

build-nc:
	docker-compose build --no-cache

up:
	docker-compose up -d
	@echo ""
	@echo "Contenedor iniciado correctamente"
	@echo "Acceso: http://localhost:8080"
	@echo ""
	@echo "Ver logs:  make logs"
	@echo "Parar:     make down"

down:
	docker-compose down

stop: down
	@echo "Contenedor detenido correctamente"

restart:
	docker-compose restart safesign-backend
	@echo "Contenedor reiniciado"

logs:
	docker-compose logs -f safesign-backend

shell:
	docker-compose exec safesign-backend bash

test:
	python3 verify_docker.py

clean:
	@echo "Esto eliminará volúmenes y datos locales"
	@read -p "¿Continuar? (s/n) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Ss]$$ ]]; then \
		docker-compose down -v; \
		echo "Limpieza completada"; \
	else \
		echo "Cancelado"; \
	fi

status:
	docker ps --filter "name=safesign"

ps:
	docker-compose ps

# Comandos de utilidad
prune:
	docker system prune -f

image-size:
	docker images | grep safesign

logs-tail:
	docker-compose logs --tail 50 safesign-backend

exec-python:
	docker-compose exec safesign-backend python

exec-bash:
	docker-compose exec safesign-backend bash

# Database
db-reset:
	docker-compose exec safesign-backend rm -f instance/safesign.db
	@echo "Base de datos reiniciada"

db-shell:
	docker-compose exec safesign-backend bash -c "python3 -c \"from app import db, create_app; app = create_app(); db.create_all()\""
	@echo "BD recreada"

# Health checks
health:
	@docker-compose exec -T safesign-backend curl -f http://localhost:8080/ > /dev/null 2>&1 && echo "App está saludable" || echo "App no responde"

version:
	@echo "SafeSign AI Backend"
	@docker-compose exec -T safesign-backend python3 --version
	@echo ""
	@docker-compose exec -T safesign-backend pip list | head -15
