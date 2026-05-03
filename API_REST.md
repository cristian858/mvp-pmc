# SafeSign AI - API REST v1 Documentation

## Overview

SafeSign AI provides a comprehensive REST API for document signing, biometric verification, and contract analysis. The API uses JSON for all request and response bodies.

### Base URL

```
http://localhost:8080/api/v1
```

### Authentication

All endpoints (except `/auth/register`, `/auth/login`, and `/auth/check`) require the user to be authenticated. Authentication is session-based (not JWT).

### Response Format

All responses follow a consistent JSON format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable error message"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    // Array of items
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "pages": 10
  }
}
```

---

## Authentication Endpoints

### Register User

Create a new user account.

```
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2026-05-02T00:56:34"
  }
}
```

**Possible Errors:**
- `missing_fields` (400): All fields are required
- `registration_failed` (400): Password mismatch or email already exists

---

### Login User

Authenticate with email and password.

```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2026-05-02T00:56:34"
  }
}
```

**Possible Errors:**
- `missing_fields` (400): Email and password are required
- `authentication_failed` (401): Invalid credentials

---

### Logout User

End the current session.

```
POST /auth/logout
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Required:** Authentication

---

### Get Current User

Get information about the authenticated user.

```
GET /auth/me
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2026-05-02T00:56:34"
  }
}
```

**Required:** Authentication

---

### Check Authentication Status

Check if the current user is authenticated (does not require login).

```
GET /auth/check
```

**Response (200 OK - Authenticated):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "authenticated": true,
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "created_at": "2026-05-02T00:56:34"
    }
  }
}
```

**Response (200 OK - Not Authenticated):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "authenticated": false
  }
}
```

---

## Document Endpoints

### List Documents

Get all documents for the authenticated user with pagination.

```
GET /documents?page=1&per_page=10
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 10): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "filename": "contrato.pdf",
      "status": "pendiente",
      "created_at": "2026-05-02T00:56:34",
      "updated_at": "2026-05-02T00:56:34",
      "resumen_ia": "Contrato de servicios...",
      "riesgos": "Riesgos identificados...",
      "obligaciones": "Obligaciones del cliente..."
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "per_page": 10,
    "pages": 1
  }
}
```

**Required:** Authentication

---

### Get Document Details

Get full details of a specific document.

```
GET /documents/{doc_id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "filename": "contrato.pdf",
    "status": "pendiente",
    "created_at": "2026-05-02T00:56:34",
    "updated_at": "2026-05-02T00:56:34",
    "resumen_ia": "Contrato de servicios...",
    "riesgos": "Riesgos identificados...",
    "obligaciones": "Obligaciones del cliente...",
    "contenido_texto": "Full text content of the PDF..."
  }
}
```

**Possible Errors:**
- `forbidden` (403): Document belongs to another user

**Required:** Authentication

---

### Upload Document

Upload and analyze a new PDF document.

```
POST /documents
Content-Type: multipart/form-data
```

**Request Data:**
- `file`: PDF file (required)

**cURL Example:**
```bash
curl -X POST http://localhost:8080/api/v1/documents \
  -F "file=@contract.pdf"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Document uploaded and analyzed successfully",
  "data": {
    "id": 2,
    "filename": "contract.pdf",
    "status": "pendiente",
    "created_at": "2026-05-02T01:00:00",
    "updated_at": "2026-05-02T01:00:00",
    "resumen_ia": "Contract summary...",
    "riesgos": "Identified risks...",
    "obligaciones": "Obligations..."
  }
}
```

**Possible Errors:**
- `missing_file` (400): No file provided
- `empty_filename` (400): File has no name
- `invalid_file_type` (400): Only PDF files are allowed
- `extraction_failed` (400): Could not extract text from PDF

**Required:** Authentication

---

### Update Document Status

Change the status of a document.

```
PATCH /documents/{doc_id}/status
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "firmado"
}
```

**Valid Statuses:**
- `pendiente`: Waiting for signature
- `firmado`: Signed
- `rechazado`: Rejected

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document status updated successfully",
  "data": {
    "id": 1,
    "filename": "contrato.pdf",
    "status": "firmado",
    "created_at": "2026-05-02T00:56:34",
    "updated_at": "2026-05-02T01:05:00",
    "resumen_ia": "...",
    "riesgos": "...",
    "obligaciones": "..."
  }
}
```

**Possible Errors:**
- `forbidden` (403): Document belongs to another user
- `invalid_status` (400): Invalid status value

**Required:** Authentication

---

### Delete Document

Remove a document and its associated file.

```
DELETE /documents/{doc_id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": null
}
```

**Possible Errors:**
- `forbidden` (403): Document belongs to another user

**Required:** Authentication

---

## Biometry Endpoints

### List Biometric Verifications

Get all biometric verifications for the user.

```
GET /biometry?page=1&per_page=10
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 10): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "estado": "verificado",
      "semaforo": "VERDE",
      "movimiento_score": 0.85,
      "distancia_facial": 2.3,
      "documento_nombre_match": true,
      "intentos": 1,
      "created_at": "2026-05-02T00:56:34"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "per_page": 10,
    "pages": 1
  }
}
```

**Required:** Authentication

---

### Get Biometric Verification Details

Get full details of a specific verification.

```
GET /biometry/{verification_id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "estado": "verificado",
    "semaforo": "VERDE",
    "movimiento_score": 0.85,
    "distancia_facial": 2.3,
    "documento_nombre_match": true,
    "intentos": 1,
    "created_at": "2026-05-02T00:56:34",
    "documento_texto": "Full OCR text from ID document..."
  }
}
```

**Possible Errors:**
- `forbidden` (403): Verification belongs to another user

**Required:** Authentication

---

### Get Verification Status

Get only the status of a verification (lightweight endpoint).

```
GET /biometry/{verification_id}/status
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "estado": "verificado",
    "semaforo": "VERDE",
    "intentos": 1,
    "documento_nombre_match": true
  }
}
```

**Required:** Authentication

---

## Signature Endpoints

### List Signatures

Get all signatures created by the user.

```
GET /signatures?page=1&per_page=10
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 10): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "document_id": 1,
      "resultado_verificacion": "VERDE",
      "fecha_firma": "2026-05-02T01:00:00",
      "notas": "Biometric verification passed"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "per_page": 10,
    "pages": 1
  }
}
```

**Required:** Authentication

---

### Get Signature Details

Get details of a specific signature.

```
GET /signatures/{sig_id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "document_id": 1,
    "resultado_verificacion": "VERDE",
    "fecha_firma": "2026-05-02T01:00:00",
    "notas": "Biometric verification passed"
  }
}
```

**Possible Errors:**
- `forbidden` (403): Signature belongs to another user

**Required:** Authentication

---

### Get Document Signatures

Get all signatures for a specific document.

```
GET /signatures/document/{doc_id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Found 2 signatures for document",
  "data": [
    {
      "id": 1,
      "document_id": 1,
      "resultado_verificacion": "VERDE",
      "fecha_firma": "2026-05-02T01:00:00",
      "notas": "Biometric verification passed"
    },
    {
      "id": 2,
      "document_id": 1,
      "resultado_verificacion": "VERDE",
      "fecha_firma": "2026-05-02T01:05:00",
      "notas": "Second signature approved"
    }
  ]
}
```

**Possible Errors:**
- `forbidden` (403): Document belongs to another user

**Required:** Authentication

---

### Create Signature

Create a new signature for a document.

```
POST /signatures/document/{doc_id}/create
Content-Type: application/json
```

**Request Body:**
```json
{
  "resultado_verificacion": "VERDE",
  "notas": "Biometric verification passed"
}
```

**Valid Results:**
- `VERDE`: Signature verified and approved
- `AMARILLO`: Signature verified with warnings
- `ROJO`: Signature rejected

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Signature created successfully",
  "data": {
    "id": 3,
    "document_id": 1,
    "resultado_verificacion": "VERDE",
    "fecha_firma": "2026-05-02T01:10:00",
    "notas": "Biometric verification passed"
  }
}
```

**Possible Errors:**
- `forbidden` (403): Document belongs to another user
- `invalid_result` (400): Invalid resultado_verificacion value

**Required:** Authentication

---

### Update Signature

Update an existing signature.

```
PATCH /signatures/{sig_id}/update
Content-Type: application/json
```

**Request Body:**
```json
{
  "resultado_verificacion": "AMARILLO",
  "notas": "Verification with warnings"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Signature updated successfully",
  "data": {
    "id": 1,
    "document_id": 1,
    "resultado_verificacion": "AMARILLO",
    "fecha_firma": "2026-05-02T01:00:00",
    "notas": "Verification with warnings"
  }
}
```

**Possible Errors:**
- `forbidden` (403): Signature belongs to another user
- `invalid_result` (400): Invalid resultado_verificacion value

**Required:** Authentication

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `missing_fields` | 400 | Required fields are missing |
| `missing_file` | 400 | No file was uploaded |
| `empty_filename` | 400 | File has no name |
| `invalid_file_type` | 400 | Only PDF files are allowed |
| `invalid_status` | 400 | Invalid document status |
| `invalid_result` | 400 | Invalid signature result |
| `extraction_failed` | 400 | Could not extract text from PDF |
| `registration_failed` | 400 | User registration failed |
| `authentication_failed` | 401 | Invalid login credentials |
| `forbidden` | 403 | Permission denied |
| `internal_error` | 500 | Server error |

---

## Rate Limiting

Currently, there are no rate limits implemented. Rate limiting will be added in a future version.

---

## Versioning

The current API version is `v1`. Future changes will increment the version number (e.g., `/api/v2`), ensuring backward compatibility for clients using the current version.

---

## Example Client Usage

### Python

```python
import requests
import json

BASE_URL = "http://localhost:8080/api/v1"
session = requests.Session()

# Register
response = session.post(f"{BASE_URL}/auth/register", json={
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "secure123",
    "password_confirm": "secure123"
})
print(response.json())

# Get documents
response = session.get(f"{BASE_URL}/documents")
documents = response.json()["data"]
print(f"Found {len(documents)} documents")

# Upload document
with open("contract.pdf", "rb") as f:
    files = {"file": f}
    response = session.post(f"{BASE_URL}/documents", files=files)
    document = response.json()["data"]
    print(f"Uploaded document: {document['id']}")

# Logout
response = session.post(f"{BASE_URL}/auth/logout")
print(response.json()["message"])
```

### cURL

```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "secure123",
    "password_confirm": "secure123"
  }' \
  -c cookies.txt

# Get documents
curl -X GET "http://localhost:8080/api/v1/documents?page=1&per_page=10" \
  -b cookies.txt

# Upload document
curl -X POST http://localhost:8080/api/v1/documents \
  -F "file=@contract.pdf" \
  -b cookies.txt

# Logout
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -b cookies.txt
```

---

## Support

For issues or questions about the API, please open an issue on GitHub.
