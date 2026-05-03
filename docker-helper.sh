#!/bin/bash

# SafeSign AI - Docker Helper Script
# Facilita operaciones comunes con Docker

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones auxiliares
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        echo "Descargalo en: https://www.docker.com/products/docker-desktop/"
        exit 1
    fi
    print_success "Docker está instalado"
}

# Build
build() {
    print_header "Construyendo imagen Docker"
    docker-compose build
    print_success "Build completado"
}

build_no_cache() {
    print_header "Construyendo imagen Docker (sin caché)"
    docker-compose build --no-cache
    print_success "Build completado"
}

# Up
up() {
    print_header "Iniciando contenedor"
    docker-compose up -d
    print_success "Contenedor iniciado"
    echo ""
    echo -e "📱 Accede a: ${BLUE}http://localhost:8080${NC}"
}

# Down
down() {
    print_header "Deteniendo contenedor"
    docker-compose down
    print_success "Contenedor detenido"
}

# Logs
logs() {
    print_header "Mostrando logs (Ctrl+C para salir)"
    docker-compose logs -f safesign-backend
}

# Status
status() {
    print_header "Estado de contenedores"
    docker ps --filter "name=safesign"
}

# Shell
shell() {
    print_header "Entrando a shell del contenedor"
    docker-compose exec safesign-backend bash
}

# Test dependencies
test_deps() {
    print_header "Verificando dependencias"
    docker-compose exec safesign-backend python -c "
import sys
print('✓ Python version:', sys.version.split()[0])

deps = [
    ('cv2', 'OpenCV'),
    ('pytesseract', 'Pytesseract'),
    ('numpy', 'NumPy'),
    ('pandas', 'Pandas'),
    ('flask', 'Flask'),
    ('PyPDF2', 'PyPDF2'),
]

for module, name in deps:
    try:
        __import__(module)
        print(f'✓ {name}: OK')
    except ImportError as e:
        print(f'✗ {name}: {e}')
"
}

# Clean
clean() {
    print_header "Limpiando Docker"
    print_warning "Esto detendrá el contenedor y eliminará volúmenes"
    read -p "¿Estás seguro? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        docker-compose down -v
        print_success "Limpieza completada"
    fi
}

# Restart
restart() {
    print_header "Reiniciando contenedor"
    docker-compose restart safesign-backend
    print_success "Contenedor reiniciado"
}

# Execute command
execute() {
    print_header "Ejecutando comando"
    docker-compose exec safesign-backend "$@"
}

# Help
show_help() {
    cat << EOF
${BLUE}SafeSign AI - Docker Helper${NC}

Uso: ./docker-helper.sh [comando]

Comandos:
    ${GREEN}build${NC}           Construir imagen Docker
    ${GREEN}build-no-cache${NC}  Construir sin caché
    ${GREEN}up${NC}              Iniciar contenedor
    ${GREEN}down${NC}            Detener contenedor
    ${GREEN}restart${NC}         Reiniciar contenedor
    ${GREEN}logs${NC}            Ver logs en tiempo real
    ${GREEN}status${NC}          Mostrar estado
    ${GREEN}shell${NC}           Entrar a bash del contenedor
    ${GREEN}test${NC}            Verificar dependencias
    ${GREEN}clean${NC}           Limpiar todo (cuidado!)
    ${GREEN}exec${NC} [cmd]      Ejecutar comando en contenedor
    ${GREEN}help${NC}            Mostrar esta ayuda

Ejemplos:
    ./docker-helper.sh up
    ./docker-helper.sh logs
    ./docker-helper.sh shell
    ./docker-helper.sh exec python --version

EOF
}

# Main
check_docker

if [[ $# -eq 0 ]]; then
    show_help
    exit 0
fi

case "$1" in
    build)
        build
        ;;
    build-no-cache)
        build_no_cache
        ;;
    up)
        up
        ;;
    down)
        down
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    shell)
        shell
        ;;
    test)
        test_deps
        ;;
    clean)
        clean
        ;;
    exec)
        shift
        execute "$@"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac
