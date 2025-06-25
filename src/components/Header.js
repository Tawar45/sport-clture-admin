import React from 'react';
import './Header.css';

const Header = ({ username, onLogout, onSidebarToggle }) => {
  return (
    <header className="header adminlte-header">
      <div className="header-left">
        <button className="menu-toggle" aria-label="Toggle sidebar" onClick={onSidebarToggle}>
          <i className="fas fa-bars"></i>
        </button>
        <span className="header-title">Admin Dashboard</span>
      </div>
      <div className="header-right">
        <span className="user-info">
          <i className="fas fa-user-circle"></i> {username}
        </span>
        <button className="logout-btn" onClick={onLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
};

export default Header; 