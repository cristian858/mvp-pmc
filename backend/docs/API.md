# API Reference

Referencia completa de endpoints de la API REST v1 de SafeSign AI.

## Base URL

```
http://localhost:8080/api/v1
```

## Autenticación

Los endpoints usan autenticación basada en sesiones (cookies).

```bash
# Registrarse
curl -X POST http://localhost:8080/api/v1/auth/register

# Login
curl -X POST http://localhost:8080/api/v1/auth/login

# Guardar cookies
curl -c cookies.txt

# Usar cookies
curl -b cookies.txt
```

## Endpoints de Autenticación

### Registrar Usuario

```
POST /auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "secure123",
  "password_confirm": "secure123"
}
```

Respuesta exitosa (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2026-05-03T10:00:00"
  }
}
```

### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "secure123"
}
```

Respuesta exitosa (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

### Obtener Usuario Actual

```
GET /auth/me
```

Respuesta (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

### Logout

```
POST /auth/logout
```

Respuesta (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Endpoints de Documentos

### Listar Documentos

```
GET /documents?page=1&per_page=10
```

Respuesta (200):
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "filename": "contrato.pdf",
      "status": "pendiente",
      "created_at": "2026-05-03T10:00:00",
      "updated_at": "2026-05-03T10:00:00"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 10,
    "pages": 1
  }
}
```

### Crear/Subir Documento

```
POST /documents
Content-Type: multipart/form-data

file: <archivo PDF>
```

Respuesta (201):
```json
{
  "success": true,
  "message": "Document uploaded and analyzed successfully",
  "data": {
    "id": 1,
    "filename": "contrato.pdf",
    "status": "pendiente",
    "created_at": "2026-05-03T10:00:00",
    "resumen_ia": "Contrato de arrendamiento...",
    "riesgos": "Cláusulas potencialmente desfavorables...",
    "obligaciones": "El arrendatario debe..."
  }
}
```

### Obtener Documento

```
GET /documents/{id}
```

Respuesta (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "contrato.pdf",
    "status": "pendiente",
    "resumen_ia": "...",
    "riesgos": "...",
    "obligaciones": "..."
  }
}
```

### Actualizar Estado de Documento

```
PATCH /documents/{id}/status
Content-Type: application/json

{
  "status": "firmado"
}
```

Estados válidos: `pendiente`, `firmado`, `rechazado`

Respuesta (200):
```json
{
  "success": true,
  "message": "Document status updated",
  "data": {
    "id": 1,
    "status": "firmado"
  }
}
```

## Endpoints de Firmas

### Crear Firma

```
POST /signatures/document/{document_id}/create
Content-Type: application/json

{
  "resultado_verificacion": "VERDE",
  "notas": "Verificación biométrica exitosa"
}
```

Respuesta (201):
```json
{
  "success": true,
  "message": "Signature created successfully",
  "data": {
    "id": 1,
    "document_id": 1,
    "resultado_verificacion": "VERDE",
    "fecha_firma": "2026-05-03T10:00:00"
  }
}
```

### Obtener Firma

```
GET /signatures/{id}
```

Respuesta (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "document_id": 1,
    "resultado_verificacion": "VERDE",
    "fecha_firma": "2026-05-03T10:00:00"
  }
}
```

## Endpoints de Biometría

### Verificación Facial

```
POST /biometry/verify
Content-Type: multipart/form-data

documento: <foto documento>
selfie: <foto rostro>
```

Respuesta (200):
```json
{
  "success": true,
  "data": {
    "resultado": "VERDE",
    "confianza": 0.95,
    "mensaje": "Verificación exitosa"
  }
}
```

## Códigos de Estado HTTP

- **200** - OK, solicitud exitosa
- **201** - Created, recurso creado exitosamente
- **400** - Bad Request, error en la solicitud
- **401** - Unauthorized, no autenticado
- **403** - Forbidden, no autorizado
- **404** - Not Found, recurso no encontrado
- **500** - Internal Server Error, error del servidor

## Respuestas de Error

Formato estándar:
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": {
    "campo": "Mensaje de error específico"
  }
}
```

Ejemplo:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": "Email ya existe",
    "password": "Contraseña muy corta"
  }
}
```

## Ejemplos con cURL

### Workflow Completo

```bash
# 1. Registrarse
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "secure123",
    "password_confirm": "secure123"
  }' \
  -c cookies.txt

# 2. Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "secure123"
  }' \
  -b cookies.txt

# 3. Subir documento
curl -X POST http://localhost:8080/api/v1/documents \
  -F "file=@contrato.pdf" \
  -b cookies.txt

# 4. Crear firma
curl -X POST http://localhost:8080/api/v1/signatures/document/1/create \
  -H "Content-Type: application/json" \
  -d '{
    "resultado_verificacion": "VERDE",
    "notas": "Verificación completada"
  }' \
  -b cookies.txt

# 5. Logout
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -b cookies.txt
```

## Testing

Usar el script de tests:
```bash
python tests/test_api.py
```

## Para Más Información

- Backend: Ver [DEVELOPMENT.md](DEVELOPMENT.md)
- Docker: Ver [DOCKER.md](DOCKER.md)
- Deploy: Ver [DEPLOYMENT.md](DEPLOYMENT.md)
