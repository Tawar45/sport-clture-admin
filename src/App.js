import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import City from './components/city/city'; // Create this file
import Games from './components/games/games'; // Create this file
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);

  const handleSidebarToggle = () => {
    setSidebarExpanded((prev) => !prev);
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className={`app-layout${sidebarExpanded ? '' : ' sidebar-collapsed'}`}>
      <Sidebar expanded={sidebarExpanded} />
      <div className="main-content">
        <Header
          username={user.username || user.email || 'User'}
          onLogout={logout}
          onSidebarToggle={handleSidebarToggle}
        />
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/games"
        element={
          <ProtectedLayout>
            <Games />
          </ProtectedLayout>
        }
      />
      <Route
        path="/city"
        element={
          <ProtectedLayout>
            <City />
          </ProtectedLayout>
        }
      />
      {/* Default route */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
