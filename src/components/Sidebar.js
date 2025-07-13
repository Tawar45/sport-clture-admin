import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ expanded }) => {
  const { user } = useAuth();

  // console.log('Sidebar rendering with expanded:', expanded); // Debug log
  // console.log('User:', user); // Debug log

  return (
    <aside className={`sidebar adminlte-sidebar${expanded ? '' : ' collapsed'}`}>
      {/* Debug element */}
      {/* <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'yellow', 
        color: 'black', 
        padding: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}></div> */}
      
      {expanded && (
        <div className="user-panel">
          <div className="image">
          {user.profile_image ? (
            <img src={user.profile_image} alt="User" />
          ) : (
          <div className="user-initial">
            {user.username?.split(' ').map((part) => part.charAt(0).toUpperCase()).join('')}
          </div>
          )}
          </div>
          <div className="info">
            <span>{user.username}</span>
          </div>
        </div>
      )}
      <nav className="sidebar-nav">
        {user.usertype === 'admin' && (
          <ul>
          <li>
            <Link to="/dashboard" >
              <i className="fas fa-tachometer-alt"></i> {expanded && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/city">
              <i className="fas fa-city"></i> {expanded && <span>City</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Sport Games</span>}
            </Link>
          </li>
          <li>
            <Link to="/vendor">
              <i className="fas fa-user-tie"></i> {expanded && <span>Vendor</span>}
            </Link>
          </li>

          <li>
            <Link to="/groundlist">
              <i className="fas fa-map-marker-alt"></i> {expanded && <span>Ground</span>}
            </Link>
          </li>
          <li>
            <Link to="/courtlist">
              <i className="fas fa-basketball-ball"></i> {expanded && <span>Court</span>}
            </Link>
          </li>
          <li>
            <Link to="/user">
              <i className="fas fa-users"></i> {expanded && <span>User</span>}
            </Link>
          </li>
          <li>
            <Link to="/bookinglist">
              <i className="fas fa-calendar-check"></i> {expanded && <span>Booking</span>}
            </Link>
          </li>
          <li>
            <Link to="/cash-collection">
              <i className="fas fa-money-bill-wave"></i> {expanded && <span>Cash Collection</span>}
            </Link>
          </li>
          <li>
            <Link to="/settlement">
              <i className="fas fa-handshake"></i> {expanded && <span>Settlement</span>}
            </Link>
          </li>
          <li>
            <Link to="/groundrequestlist">
              <i className="fas fa-clipboard-list"></i> {expanded && <span>Ground request</span>}
            </Link>
          </li>
          <li>
            <Link to="/reports">
              <i className="fas fa-chart-bar"></i> {expanded && <span>Reports</span>}
            </Link>
          </li>

          <li>
            <Link to="/games">
              <i className="fas fa-chart-line"></i> {expanded && <span>Finance report</span>}
            </Link>
          </li>
          <li>
            <Link to="/settings">
              <i className="fas fa-cog"></i> {expanded && <span>Settings</span>}
            </Link>
          </li>
          {/* <li>
            <Link to="/change-password">
              <i className="fas fa-key"></i> {expanded && <span>Change Password</span>}
            </Link>
          </li> */}
          </ul>
        )}
        {user.usertype === 'vendor' && (
          <ul>
            <li>
              <Link to="/dashboard">
                <i className="fas fa-tachometer-alt"></i> {expanded && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/ground">
                <i className="fas fa-map-marker-alt"></i> {expanded && <span>Ground</span>}
              </Link>
            </li>
            <li>
              <Link to="/courtlist">
                <i className="fas fa-basketball-ball"></i> {expanded && <span>Court</span>}
              </Link>
            </li>
            <li>
            <Link to="/settings">
              <i className="fas fa-cog"></i> {expanded && <span>Settings</span>}
            </Link>
          </li>            
          </ul>
        )}
        </nav>
    </aside>
  );
};

export default Sidebar;
