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
import Ground from './components/ground/ground'; // Create this file
import Vendor from './components/vendor/vendor';
import EditVendor from './components/vendor/edit-vendor';
import User from './components/user/user';
import EditUser from './components/user/edit-user';
import CourtList from './components/court/List/courtlist';
import AddCourt from './components/court/Add/addcourt';
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
      <Route
        path="/vendor"
        element={
          <ProtectedLayout>
            <Vendor />
          </ProtectedLayout>
        }
      />
      <Route
        path="/vendor/edit/:id"
        element={
          <ProtectedLayout>
            <EditVendor />
          </ProtectedLayout>
        }
      />
      <Route
        path="/ground"
        element={
          <ProtectedLayout>
            <Ground />
          </ProtectedLayout>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedLayout>
            <User />
          </ProtectedLayout>
        }
      />
      <Route
        path="/user/edit/:id"
        element={
          <ProtectedLayout>
            <EditUser />
          </ProtectedLayout>
        }
      />
      <Route
        path="/courtlist"
        element={
          <ProtectedLayout>
            <CourtList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/court/add"
        element={
          <ProtectedLayout>
            <AddCourt />
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
