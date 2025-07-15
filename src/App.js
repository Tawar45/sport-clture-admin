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
import GroundList from './components/ground/groundlist'; // Create this file
import Vendor from './components/vendor/vendor';
import EditVendor from './components/vendor/edit-vendor';
import User from './components/user/user';
import EditUser from './components/user/edit-user';
import CourtList from './components/court/List/courtlist';
import AddCourt from './components/court/Add/addcourt';
import UpdateCourt from './components/court/update/updatecourt';
import { AuthProvider, useAuth } from './context/AuthContext';
import BookingList from './components/booking/bookinglist';
import AddBooking from './components/booking/addbooking';
import UpdateBooking from './components/booking/updatebooking';
import CashCollection from './components/booking/CashCollection';
import Settlement from './components/booking/Settlement';
import PasswordChange from './components/PasswordChange';
import Report from './components/Report';
import GroundRequestList from './components/groundRequest/groundRequestList';


function ProtectedLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = React.useState(() => {
    // Get sidebar state from localStorage, default to true if not set
    const saved = localStorage.getItem('sidebarExpanded');
    const initialState = saved !== null ? JSON.parse(saved) : true;
    console.log('Initial sidebar state:', initialState); // Debug log
    return initialState;
  });

  const handleSidebarToggle = () => {
    setSidebarExpanded((prev) => {
      const newState = !prev;
      console.log('Toggling sidebar to:', newState); // Debug log
      // Save to localStorage
      localStorage.setItem('sidebarExpanded', JSON.stringify(newState));
      return newState;
    });
  };

  console.log('Current sidebar state:', sidebarExpanded); // Debug log
  console.log('User authenticated:', !!user); // Debug log

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
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <div>Loading...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
        path="/groundlist"
        element={
          <ProtectedLayout>
            <GroundList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/ground/add"
        element={
          <ProtectedLayout>
            <Ground />
          </ProtectedLayout>
        }
      />
      <Route
        path="/ground/edit/:id"
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
      <Route
        path="/court/edit/:id"
        element={
          <ProtectedLayout>
            <UpdateCourt />
          </ProtectedLayout>
        }
      />
     <Route
        path="/bookinglist"
        element={
          <ProtectedLayout>
            <BookingList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/add-booking"
        element={
          <ProtectedLayout>
            <AddBooking />
          </ProtectedLayout>
        }
      />
      <Route
        path="/booking/edit/:id"
        element={
          <ProtectedLayout>
            <UpdateBooking />
          </ProtectedLayout>
        }
      />
      <Route
        path="/cash-collection"
        element={
          <ProtectedLayout>
            <CashCollection />
          </ProtectedLayout>
        }
      />
        <Route
        path="/settlement"
        element={
          <ProtectedLayout>
            <Settlement />
          </ProtectedLayout>
        }
      />
    <Route
        path="/report"
        element={
          <ProtectedLayout>
            <Report />
          </ProtectedLayout>
        }
      />
          
      <Route
        path="/groundrequestlist"
        element={
          <ProtectedLayout>
            <GroundRequestList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <PasswordChange />
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
