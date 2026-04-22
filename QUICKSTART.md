**GUÍA RÁPIDA - SafeSign AI**

# 🚀 Ejecutar SafeSign AI en 5 minutos

## 1. Instalar Dependencias

```bash
# Windows
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2. Ejecutar la Aplicación

```bash
python scripts/serve.py
# o
python scripts/run.py
```

Abrirá en `http://localhost:5000`

## 3. Primera Vez - Crear Cuenta

1. Haz clic en "Registro"
2. Completa el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: Mínimo 8 caracteres

## 4. Flujo Básico

### Paso 1: Subir Documento
1. Click en "Subir Documento"
2. Selecciona un archivo PDF
3. El sistema analizará automáticamente con IA (modo mock)

### Paso 2: Ver Análisis
1. Tu documento aparecerá en el Dashboard
2. Haz click en "Ver"
3. Verás:
   - Resumen automático
   - Obligaciones detectadas
   - Riesgos identificados

### Paso 3: Verificación Biométrica con cámara
1. Click en "Verificar Identidad"
2. Permite el acceso a la cámara
3. Captura tu documento y luego realiza la selfie con movimientos
4. Obtendrás un semáforo (VERDE/AMARILLO/ROJO)

### Paso 4: Firmar
1. Click en "Firmar Documento"
2. Dibuja tu firma en el lienzo
3. Haz click en "Guardar Firma"

### Resultado
✓ Documento firmado y guardado en la BD

---

## 📋 Cuentas de Prueba

Para testing rápido, puedes crear cuenta con:
- **Email**: demo@safesign.ai
- **Contraseña**: Demo1234

---

## 🔧 Estructura de Carpetas

```
ProyectoPMC/
├── app/                 # Aplicación principal
├── venv/               # Entorno virtual (se crea al instalar)
├── instance/           # BD SQLite (se crea al ejecutar)
├── data/               # Documentos subidos, firmas
│   ├── uploads/        # PDFs subidos
│   ├── signatures/     # Firmas guardadas
│   └── capturas/       # Fotos de verificación
├── scripts/            # Scripts de ejecución
│   ├── run.py
│   └── serve.py
├── tools/legacy/       # Prototipo biométrico original
└── requirements.txt    # Dependencias
```

---

## 🌐 URLs Principales

- **Home**: http://localhost:5000/
- **Login**: http://localhost:5000/login
- **Registro**: http://localhost:5000/register
- **Dashboard**: http://localhost:5000/dashboard (requiere login)
- **Subir**: http://localhost:5000/upload
- **Verificación**: http://localhost:5000/verify

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"
```bash
# Solución:
pip install -r requirements.txt --force-reinstall
```

### "Port 5000 already in use"
```bash
# Cambiar puerto en scripts/serve.py:
app.run(port=5001)  # o cualquier otro puerto
```

### BD corrupta
```bash
# Eliminar y recrear:
rm instance/safesign.db
python scripts/serve.py  # Se recrea automáticamente
```

---

## 📚 Documentación Completa

Ver `README.md` para documentación completa incluyendo:
- Arquitectura del proyecto
- Modelos de BD
- Documentación API
- Deploy a producción

---

## 🎯 Próximos Pasos (Después del MVP)

1. **Instalar DeepFace + TensorFlow** para biometría avanzada opcional:
   ```bash
   pip install deepface tensorflow protobuf
   ```

2. **Integrar OpenAI/Claude API** para IA real:
   - Obtener API key
   - Configurar en `.env`
   - Editar `app/services/ai_analyzer.py`

3. **Deploy a producción**:
   - Cambiar BD a PostgreSQL
   - Usar Gunicorn como servidor
   - Deploy en Heroku, AWS, o similar

---

**¿Preguntas?** Revisa el README.md o el código comentado en app/
