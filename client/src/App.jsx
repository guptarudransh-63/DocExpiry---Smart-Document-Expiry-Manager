import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import AddDocument from './pages/AddDocument';
import DocumentDetails from './pages/DocumentDetails';
import EditDocument from './pages/EditDocument';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1f2937',
                color: '#fff',
                fontSize: '13px',
                borderRadius: '10px',
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes inside MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/add" element={<AddDocument />} />
              <Route path="/documents/:id" element={<DocumentDetails />} />
              <Route path="/documents/:id/edit" element={<EditDocument />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                  <div className="text-center">
                    <h1 className="text-6xl font-black text-primary-600">404</h1>
                    <h2 className="mt-2 text-xl font-bold text-gray-900">Page not found</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      The page you are looking for does not exist or has been moved.
                    </p>
                    <a href="/" className="btn-primary inline-block mt-5">
                      Return to Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
