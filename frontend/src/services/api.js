import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';
const BASE_URL = 'http://localhost:8080';

// Cliente para API REST con prefijo /api/v1
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Cliente sin baseURL - usa URL relativa al servidor de desarrollo
// Vite proxy redirige /verify/* a http://localhost:8080/verify/*
const proxyClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Servicio de Autenticación
export const authService = {
  register: (name, email, password, passwordConfirm) =>
    apiClient.post('/auth/register', {
      name,
      email,
      password,
      password_confirm: passwordConfirm,
    }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  checkAuth: () =>
    apiClient.get('/auth/check'),
};

// Servicio de Documentos
export const documentService = {
  list: (page = 1, perPage = 10) =>
    apiClient.get('/documents', { params: { page, per_page: perPage } }),

  get: (docId) =>
    apiClient.get(`/documents/${docId}`),

  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (docId) =>
    apiClient.delete(`/documents/${docId}`),

  updateStatus: (docId, status) =>
    apiClient.patch(`/documents/${docId}/status`, { status }),
};

// Servicio de Biometría (API REST)
export const biometryService = {
  list: (page = 1, perPage = 10) =>
    apiClient.get('/biometry', { params: { page, per_page: perPage } }),

  get: (verificationId) =>
    apiClient.get(`/biometry/${verificationId}`),

  getStatus: (verificationId) =>
    apiClient.get(`/biometry/${verificationId}/status`),
};

// Servicio de Verificación Facial (usa proxy de Vite)
export const verifyService = {
  checkDependencies: () =>
    proxyClient.get('/verify/dependencies'),

  captureId: (imageBlob) => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'id_photo.jpg');
    return proxyClient.post('/verify/capture-id', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  captureSelfie: (imageBlob, verificationId) => {
    const formData = new FormData();
    formData.append('selfie_image', imageBlob, 'selfie.jpg');
    formData.append('verification_id', verificationId);
    return proxyClient.post('/verify/capture-selfie', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  verify: (verificationId) =>
    proxyClient.post('/verify/verify', { verification_id: verificationId }),

  getResult: (verificationId) =>
    proxyClient.get(`/verify/${verificationId}/result`),
};

// Servicio de Firmas
export const signatureService = {
  list: (page = 1, perPage = 10) =>
    apiClient.get('/signatures', { params: { page, per_page: perPage } }),

  get: (sigId) =>
    apiClient.get(`/signatures/${sigId}`),

  getDocumentSignatures: (docId) =>
    apiClient.get(`/signatures/document/${docId}`),

  create: (docId, resultadoVerificacion, notas = '') =>
    apiClient.post(`/signatures/document/${docId}/create`, {
      resultado_verificacion: resultadoVerificacion,
      notas,
    }),

  update: (sigId, resultadoVerificacion, notas) =>
    apiClient.patch(`/signatures/${sigId}/update`, {
      resultado_verificacion: resultadoVerificacion,
      notas,
    }),
};

export default apiClient;
