import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = ({ expanded }) => {
  return (
    <aside className={`sidebar adminlte-sidebar${expanded ? '' : ' collapsed'}`}>
      {expanded && (
        <div className="user-panel">
          <div className="image">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
          </div>
          <div className="info">
            <span>Admin User</span>
          </div>
        </div>
      )}
      <nav className="sidebar-nav">
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
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Ground request</span>}
            </Link>
          </li>
                    <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Add Ground</span>}
            </Link>
          </li>
                    <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Add Court</span>}
            </Link>
          </li>
          <li>
            <Link to="/games">
              <i className="fas fa-gamepad"></i> {expanded && <span>Users</span>}
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
      </nav>
    </aside>
  );
};

export default Sidebar;
