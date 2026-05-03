# 🧪 Instrucciones para Probar Docker en tu M4 Mac

## Paso 1: Preparar el entorno

```bash
cd /Users/cristian/Dev/pmc/ProyectoPMC

# Asegúrate de tener Docker Desktop corriendo
# (Abre Applications > Docker.app)

# Verifica Docker
docker --version
```

## Paso 2: Crear archivo .env

```bash
# Copiar configuración
cp .env.docker .env

# (El archivo ya contiene configuración por defecto)
```

## Paso 3: Build de la imagen

```bash
# Primera vez toma 5-10 minutos (pre-compila todo)
docker-compose build

# Si hay error, intenta sin caché:
docker-compose build --no-cache
```

Esto debería terminar con:
```
#19 exporting to image
#19 exporting layers done
#19 naming to docker.io/library/safesign-backend:latest done
#19 DONE 6.5s
```

## Paso 4: Iniciar el contenedor

```bash
# Iniciar en background
docker-compose up -d

# Verificar que está corriendo
docker ps

# Deberías ver:
# CONTAINER ID  IMAGE                    STATUS
# xxxxx         safesign-backend:latest  Up 10 seconds
```

## Paso 5: Verificar que funciona

### Opción A: Script Python (recomendado)
```bash
python3 verify_docker.py
```

Debería mostrar:
```
✓ Contenedor está corriendo
✓ Flask
✓ OpenCV
✓ NumPy
✓ Pandas
✓ Pytesseract
✓ SQLAlchemy
✓ Tabla users
✓ Tabla documents
✓ Tabla signatures
✓ Tabla biometric_verifications

✅ SafeSign AI está listo!

📱 Accede a: http://localhost:5000
```

### Opción B: Verificación manual
```bash
# Ver logs
docker-compose logs -f safesign-backend

# En otra terminal, probar acceso
curl http://localhost:5000/

# Deberías recibir HTML (redirect a login)
```

### Opción C: Usar helper script
```bash
./docker-helper.sh test
```

## Paso 6: Acceder a la app

Abre en tu navegador:
```
http://localhost:5000/
```

Debería mostrar la página de login de SafeSign AI.

## Paso 7: Probar funcionalidad básica

1. **Regístrate** con un usuario nuevo
2. **Login** con tus credenciales
3. **Subir un PDF** desde el dashboard
4. **Ver análisis** del documento

## Comandos Útiles mientras Testeas

```bash
# Ver logs en vivo (Ctrl+C para salir)
docker-compose logs -f safesign-backend

# Entrar a shell del contenedor
docker-compose exec safesign-backend bash

# Ejecutar comando Python
docker-compose exec safesign-backend python -c "import cv2; print(cv2.__version__)"

# Reiniciar el contenedor
docker-compose restart safesign-backend

# Ver estado
docker ps

# Detener
docker-compose down
```

## Solución de Problemas durante Test

### "Port 5000 already in use"
```bash
# Cambiar en .env
FLASK_PORT=8000
# Luego recrear: docker-compose down && docker-compose up -d
```

### "ConnectionRefusedError"
```bash
# Esperar a que se inicie completamente (30 segundos)
sleep 30
curl http://localhost:5000/
```

### "ModuleNotFoundError"
```bash
# Reconstruir sin caché
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Build muy lento
Es normal la primera vez (pre-compilación de C++). Toma 5-10 minutos.

Si está "pegado", usa Ctrl+C y:
```bash
docker-compose build --no-cache 2>&1 | tail -50
```

### Volúmenes no persisten
```bash
# Crear directorios locales
mkdir -p data/uploads data/capturas data/signatures instance
docker-compose up -d
```

## ✅ Checklist de Verificación

- [ ] Docker Desktop está corriendo
- [ ] `docker --version` muestra 24.0.0+
- [ ] `docker-compose build` completa exitosamente
- [ ] `docker-compose up -d` inicia sin errores
- [ ] `docker ps` muestra el contenedor safesign-backend
- [ ] `curl http://localhost:5000/` retorna HTML
- [ ] `verify_docker.py` muestra ✅
- [ ] Navegador abre `http://localhost:5000/` sin problemas
- [ ] Puedes registrarte e iniciar sesión
- [ ] Puedes subir un PDF

## 🎉 ¡Listo!

Si todo pasa el checklist, tu Docker está **100% funcional** en tu M4 Mac.

### Siguientes pasos

1. **Opcional**: Lee DOCKER_GUIDE.md para información avanzada
2. **Próximo**: Fase 2 - Refactorizar a API REST
3. **Luego**: Fase 3 - Crear Frontend React

---

## Notas Importantes

- El contenedor contiene **Python 3.11 optimizado para arm64**
- Todas las librerías se pre-compilan en el build
- Los datos persisten en `data/` y `instance/` locales
- El `.env` controla la configuración
- Puedes detener/iniciar sin perder datos

¡Happy testing! 🚀
