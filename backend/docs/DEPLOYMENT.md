# Deployment Guide

Guía para desplegar SafeSign AI a producción.

## Requisitos Previos

- Servidor Linux/Ubuntu con Python 3.9+
- Docker y Docker Compose (recomendado)
- PostgreSQL 12+ (recomendado para producción)
- Nginx o Apache (reverse proxy)
- SSL/TLS certificate (ej. Let's Encrypt)
- Dominio propio

## Opción 1: Docker (Recomendado)

### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install docker.io docker-compose -y

# Agregar usuario actual a grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clonar Repositorio

```bash
# Clonar en servidor
git clone git@github-university:cristian858/mvp-pmc.git
cd mvp-pmc/backend
```

### 3. Configurar Variables

```bash
# Crear archivo .env para producción
cp .env.docker .env

# Editar con valores de producción
nano .env
```

Valores importantes para producción:
```env
FLASK_ENV=production
SECRET_KEY=generar-clave-segura-aleatoria
USE_MOCK_AI=false
OPENAI_API_KEY=your-key-here
DATABASE_URL=postgresql://user:password@localhost/safesign_db
FLASK_PORT=8080
```

### 4. Generar SECRET_KEY

```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Construir y Ejecutar

```bash
# Construir imagen
docker-compose build

# Iniciar en background
docker-compose up -d

# Verificar
docker-compose ps
docker-compose logs safesign-backend
```

### 6. Nginx como Reverse Proxy

Crear `/etc/nginx/sites-available/safesign`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar:
```bash
sudo ln -s /etc/nginx/sites-available/safesign /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL/TLS (Let's Encrypt)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Opción 2: Instalación Manual

### 1. Requisitos de Sistema

```bash
sudo apt install python3.9 python3.9-venv postgresql postgresql-contrib nginx -y
```

### 2. Setup del Proyecto

```bash
# Clonar
git clone git@github-university:cristian858/mvp-pmc.git
cd mvp-pmc/backend

# Entorno virtual
python3 -m venv venv
source venv/bin/activate

# Dependencias
pip install -r requirements.txt

# BD (si usas PostgreSQL)
pip install psycopg2-binary
```

### 3. Configurar BD

```bash
sudo -u postgres psql << EOF
CREATE DATABASE safesign_db;
CREATE USER safesign_user WITH PASSWORD 'your-password';
ALTER ROLE safesign_user SET client_encoding TO 'utf8';
ALTER ROLE safesign_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE safesign_user SET default_transaction_deferrable TO on;
ALTER ROLE safesign_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE safesign_db TO safesign_user;
EOF
```

### 4. Usar Gunicorn

```bash
pip install gunicorn

# Ejecutar
gunicorn -w 4 -b 0.0.0.0:8080 scripts.serve:app
```

### 5. Systemd Service

Crear `/etc/systemd/system/safesign.service`:

```ini
[Unit]
Description=SafeSign AI Backend
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/path/to/mvp-pmc/backend
Environment="PATH=/path/to/mvp-pmc/backend/venv/bin"
ExecStart=/path/to/mvp-pmc/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8080 scripts.serve:app

[Install]
WantedBy=multi-user.target
```

Habilitar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable safesign
sudo systemctl start safesign
```

## Monitoreo en Producción

### Logs

```bash
# Docker
docker-compose logs -f safesign-backend

# Systemd
journalctl -u safesign -f
```

### Health Check

```bash
# Endpoint de salud
curl https://tu-dominio.com/health

# O programado cada 5 minutos
*/5 * * * * curl -f https://tu-dominio.com/health || mail -s "SafeSign Down" admin@example.com
```

### Backups

```bash
# BD PostgreSQL
pg_dump safesign_db > backup_$(date +%Y%m%d).sql

# Datos de usuario
tar -czf safesign_data_$(date +%Y%m%d).tar.gz backend/data/

# Programar (crontab)
0 2 * * * pg_dump safesign_db > /backups/safesign_$(date +\%Y\%m\%d).sql
```

## Mantenimiento

### Actualizar Código

```bash
# Con Docker
cd backend
git pull origin main
docker-compose build
docker-compose up -d

# Manual
cd backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt -U
systemctl restart safesign
```

### Migrar BD

```bash
# Con Flask-Migrate (si está configurado)
python manage.py db upgrade
```

### Eliminar Datos Antiguos

```bash
# Limpiar uploads antiguos (30 días)
find backend/data/uploads -type f -mtime +30 -delete
```

## Seguridad

### En Producción

1. Cambiar todas las contraseñas por defecto
2. Usar variables de entorno para secretos
3. Habilitar HTTPS/SSL obligatoriamente
4. Configurar firewall:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
5. Mantener sistemas actualizados
6. Usar autoridades de confianza para SSL

### Base de Datos

```bash
# Backup regular
pg_dump safesign_db > backup.sql

# Permissions
sudo chown www-data:www-data /path/to/backend/data/
sudo chmod 750 /path/to/backend/data/
```

## Troubleshooting

### Puertos Cerrados

```bash
sudo ufw allow 8080/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Permisos de Archivos

```bash
sudo chown -R www-data:www-data /path/to/backend
sudo chmod -R 750 /path/to/backend
```

### BD Llena

```bash
# Ver tamaño
du -sh /var/lib/postgresql/

# Limpiar logs antiguos
vacuumdb safesign_db
```

### Fuera de Memoria

```bash
# Reducir workers de Gunicorn
gunicorn -w 2 -b 0.0.0.0:8080 scripts.serve:app

# O en systemd
ExecStart=... gunicorn -w 2 ...
```

## Escalado

Para mayor tráfico:

1. Usar load balancer (nginx, HAProxy)
2. Múltiples instancias de aplicación
3. Redis para cache/sessions
4. CDN para assets estáticos
5. Database replication

## Para Más Información

- Docker: [DOCKER.md](DOCKER.md)
- Desarrollo: [DEVELOPMENT.md](DEVELOPMENT.md)
- API: [API.md](API.md)
