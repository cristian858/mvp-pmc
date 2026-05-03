# SafeSign AI - REST API Quick Start

## Start the Server

```bash
# Using Docker (recommended for Apple Silicon M4)
docker-compose up -d

# Or run directly
python scripts/serve.py
```

Server will be available at: **http://localhost:8080**

---

## API Base URL

```
http://localhost:8080/api/v1
```

---

## Quick Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "secure123",
    "password_confirm": "secure123"
  }' \
  -c cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2026-05-03T01:00:53.044171"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "secure123"
  }' \
  -c cookies.txt
```

### 3. Get Current User Info

```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -b cookies.txt
```

### 4. List Documents

```bash
curl -X GET "http://localhost:8080/api/v1/documents?page=1&per_page=10" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "per_page": 10,
    "pages": 0
  }
}
```

### 5. Upload a PDF Document

```bash
curl -X POST http://localhost:8080/api/v1/documents \
  -F "file=@contract.pdf" \
  -b cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded and analyzed successfully",
  "data": {
    "id": 1,
    "filename": "contract.pdf",
    "status": "pendiente",
    "created_at": "2026-05-03T01:05:00",
    "updated_at": "2026-05-03T01:05:00",
    "resumen_ia": "Contract summary...",
    "riesgos": "Identified risks...",
    "obligaciones": "Obligations..."
  }
}
```

### 6. Get Document Details

```bash
curl -X GET http://localhost:8080/api/v1/documents/1 \
  -b cookies.txt
```

### 7. Update Document Status

```bash
curl -X PATCH http://localhost:8080/api/v1/documents/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "firmado"}' \
  -b cookies.txt
```

Valid statuses: `pendiente`, `firmado`, `rechazado`

### 8. Create a Signature

```bash
curl -X POST http://localhost:8080/api/v1/signatures/document/1/create \
  -H "Content-Type: application/json" \
  -d '{
    "resultado_verificacion": "VERDE",
    "notas": "Biometric verification passed"
  }' \
  -b cookies.txt
```

### 9. List Signatures for a Document

```bash
curl -X GET http://localhost:8080/api/v1/signatures/document/1 \
  -b cookies.txt
```

### 10. Logout

```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -b cookies.txt
```

---

## Python Client Example

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
user = response.json()["data"]
print(f"✓ Registered: {user['name']}")

# Get documents
response = session.get(f"{BASE_URL}/documents")
docs = response.json()["data"]
print(f"✓ Documents: {len(docs)} found")

# Upload a document
with open("contract.pdf", "rb") as f:
    files = {"file": f}
    response = session.post(f"{BASE_URL}/documents", files=files)
    document = response.json()["data"]
    print(f"✓ Uploaded: {document['filename']} (ID: {document['id']})")
    
    # Create a signature
    response = session.post(
        f"{BASE_URL}/signatures/document/{document['id']}/create",
        json={
            "resultado_verificacion": "VERDE",
            "notas": "All checks passed"
        }
    )
    signature = response.json()["data"]
    print(f"✓ Signature created: {signature['resultado_verificacion']}")

# List documents
response = session.get(f"{BASE_URL}/documents")
print(f"✓ Total documents: {response.json()['pagination']['total']}")

# Logout
response = session.post(f"{BASE_URL}/auth/logout")
print(f"✓ Logged out: {response.json()['message']}")
```

---

## JavaScript Fetch Example

```javascript
const BASE_URL = 'http://localhost:8080/api/v1';

// Register
async function register() {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'secure123',
      password_confirm: 'secure123'
    })
  });
  const data = await response.json();
  console.log('✓ Registered:', data.data.name);
  return data.data;
}

// Get documents
async function getDocuments(page = 1, perPage = 10) {
  const response = await fetch(
    `${BASE_URL}/documents?page=${page}&per_page=${perPage}`,
    {
      method: 'GET',
      credentials: 'include'
    }
  );
  const data = await response.json();
  console.log('✓ Documents:', data.pagination.total);
  return data.data;
}

// Upload document
async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  const data = await response.json();
  console.log('✓ Uploaded:', data.data.filename);
  return data.data;
}

// Create signature
async function createSignature(docId, result = 'VERDE', notes = '') {
  const response = await fetch(
    `${BASE_URL}/signatures/document/${docId}/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        resultado_verificacion: result,
        notas: notes
      })
    }
  );
  const data = await response.json();
  console.log('✓ Signature created:', data.data.resultado_verificacion);
  return data.data;
}

// Check authentication
async function checkAuth() {
  const response = await fetch(`${BASE_URL}/auth/check`, {
    credentials: 'include'
  });
  const data = await response.json();
  return data.data.authenticated;
}

// Usage
(async () => {
  const user = await register();
  const docs = await getDocuments();
  const authenticated = await checkAuth();
  console.log('Authenticated:', authenticated);
})();
```

---

## Full API Documentation

For comprehensive API documentation including all endpoints, error codes, and parameters, see **[API_REST.md](./API_REST.md)**.

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Login required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

## Common Error Responses

### Missing Authentication
```json
{
  "success": false,
  "error": "unauthorized",
  "message": "Login required"
}
```

### Invalid Input
```json
{
  "success": false,
  "error": "invalid_file_type",
  "message": "Only PDF files are allowed"
}
```

### Permission Denied
```json
{
  "success": false,
  "error": "forbidden",
  "message": "You do not have permission to access this resource"
}
```

---

## Testing the API

### Using Docker

```bash
# Start the server
docker-compose up -d

# Run tests
./test_api.sh

# View logs
docker-compose logs -f
```

### Using Python

```bash
python -m pytest tests/
```

---

## Next Steps

1. **Read [API_REST.md](./API_REST.md)** - Complete endpoint reference
2. **Try the examples above** - Test basic operations
3. **Build a frontend** - Use React, Vue, or any framework
4. **Deploy** - Use Gunicorn + PostgreSQL for production

---

## Need Help?

- Check **API_REST.md** for complete documentation
- See **DOCKER_GUIDE.md** for Docker setup
- Open an issue on GitHub for bugs or features

Enjoy building with SafeSign AI! 🚀
