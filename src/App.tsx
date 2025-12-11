import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRide from './pages/CreateRide';
import EditRide from './pages/EditRide';
import JoinRide from './pages/JoinRide';
import RideDetails from './pages/RideDetails';
import OwnedRidesPage from './pages/OwnedRidesPage';
import JoinedRidesPage from './pages/JoinedRidesPage';
import AvailableRidesPage from './pages/AvailableRidesPage';
import Presentation from './pages/Presentation';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.error('ProtectedRoute: No user found, redirecting to login. Token exists:', !!localStorage.getItem('token'));
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout
import MainLayout from './layouts/MainLayout';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/presentation" element={<Presentation />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected routes wrapped in MainLayout */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateRide />} />
        <Route path="/rides/:id/edit" element={<EditRide />} />
        <Route path="/join" element={<JoinRide />} />
        <Route path="/rides/:id" element={<RideDetails />} />
        <Route path="/rides/organized" element={<OwnedRidesPage />} />
        <Route path="/rides/upcoming" element={<JoinedRidesPage />} />
        <Route path="/rides/available" element={<AvailableRidesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
