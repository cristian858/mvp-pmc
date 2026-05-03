.PHONY: help build up down logs shell restart clean test

# SafeSign AI - Makefile
# Proporciona comandos cortos para operaciones comunes

help:
	@echo "SafeSign AI - Docker Commands"
	@echo "========================================"
	@echo ""
	@echo "make build          Construir imagen"
	@echo "make build-nc       Construir sin caché"
	@echo "make up             Iniciar contenedor"
	@echo "make down           Detener contenedor"
	@echo "make restart        Reiniciar"
	@echo "make logs           Ver logs en vivo"
	@echo "make shell          Entrar a bash"
	@echo "make test           Verificar dependencias"
	@echo "make clean          Limpiar todo"
	@echo "make status         Ver estado"
	@echo ""
	@echo "Ejemplo: make up && make logs"

build:
	docker-compose build

build-nc:
	docker-compose build --no-cache

up:
	docker-compose up -d
	@echo "✓ Contenedor iniciado en http://localhost:5000"

down:
	docker-compose down

restart:
	docker-compose restart safesign-backend
	@echo "✓ Contenedor reiniciado"

logs:
	docker-compose logs -f safesign-backend

shell:
	docker-compose exec safesign-backend bash

test:
	python3 verify_docker.py

clean:
	@echo "⚠️  Esto eliminará volúmenes y datos locales"
	@read -p "¿Continuar? (s/n) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Ss]$$ ]]; then \
		docker-compose down -v; \
		echo "✓ Limpieza completada"; \
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
	@echo "✓ Base de datos reiniciada"

db-shell:
	docker-compose exec safesign-backend bash -c "python3 -c \"from app import db, create_app; app = create_app(); db.create_all()\""
	@echo "✓ BD recreada"

# Health checks
health:
	@docker-compose exec -T safesign-backend curl -f http://localhost:5000/ > /dev/null 2>&1 && echo "✓ App está saludable" || echo "✗ App no responde"

version:
	@echo "SafeSign AI Backend"
	@docker-compose exec -T safesign-backend python3 --version
	@echo ""
	@docker-compose exec -T safesign-backend pip list | head -15
