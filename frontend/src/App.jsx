import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { DocumentsList } from './pages/DocumentsList';
import { DocumentView } from './pages/DocumentView';
import { BiometryPage } from './pages/BiometryPage';
import { SignaturePage } from './pages/SignaturePage';
import { SignaturesPage } from './pages/SignaturesPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas protegidas */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <DocumentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents/:id"
                element={
                  <ProtectedRoute>
                    <DocumentView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/biometry"
                element={
                  <ProtectedRoute>
                    <BiometryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signature/:documentId"
                element={
                  <ProtectedRoute>
                    <SignaturePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signatures"
                element={
                  <ProtectedRoute>
                    <SignaturesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirecciones */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer />
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;

