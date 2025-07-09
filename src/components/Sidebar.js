import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ expanded }) => {
  const { user } = useAuth();

  return (
    <aside className={`sidebar adminlte-sidebar${expanded ? '' : ' collapsed'}`}>
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
              <i className="fas fa-gamepad"></i> {expanded && <span>Vendor</span>}
            </Link>
          </li>

          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Ground request</span>}
            </Link>
          </li>
                    <li>
            <Link to="/ground">
              <i className="fas fa-gamepad"></i> {expanded && <span>Add Ground</span>}
            </Link>
          </li>
          <li>
            <Link to="/courtlist">
              <i className="fas fa-gamepad"></i> {expanded && <span>Court</span>}
            </Link>
          </li>
          <li>
            <Link to="/user">
              <i className="fas fa-gamepad"></i> {expanded && <span>User</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Booking</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Volunteer Request</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Reports</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Cash Collection</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Settlement</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Finance report</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-settings"></i> {expanded && <span>Settings</span>}
            </Link>
          </li>
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
                <i className="fas fa-gamepad"></i> {expanded && <span>Ground</span>}
              </Link>
            </li>
            <li>
              <Link to="/courtlist">
                <i className="fas fa-gamepad"></i> {expanded && <span>Court</span>}
              </Link>
            </li>            
          </ul>
        )}
        </nav>
    </aside>
  );
};

export default Sidebar;
