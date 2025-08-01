import React, { useState, useEffect } from 'react';
import { FaUsers, FaStore, FaCity, FaCalendarCheck, FaMapMarkerAlt, FaBasketballBall, FaGamepad } from 'react-icons/fa';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    vendors: 0,
    cities: 0,
    bookings: 0,
    grounds: 0,
    courts: 0,
    games: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(user.id,'id');
    const fetchStats = async () => {
      try {
        setLoading(true);
        let url ='';      
        if(user.usertype == 'vendor'){
           url = `${API_URL}/dashboard/stats?id=${user.id}`;
        }else{
           url = `${API_URL}/dashboard/stats`;    
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        const result = await response.json();
        if (result.success && result.data) {
          setStats(result.data);
          setError(null);
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard statistics');
        }
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error fetching dashboard stats:', err);
        // Fallback to mock data if API fails

      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard statistics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard dashboard-container">
      <h1>Dashboard</h1>
      <div className="stats-grid">

{/* Visible to both Admin and Vendor */}


{/* Visible to Admin only */}
{user.usertype === 'admin' && (
  <>
  <div className="stat-box users">
  <div className="icon">
    <FaUsers />
  </div>
  <h3>Total Users</h3>
  <div className="number">{stats.users || 0}</div>
</div>
    <div className="stat-box vendors">
      <div className="icon">
        <FaStore />
      </div>
      <h3>Active Vendors</h3>
      <div className="number">{stats.vendors || 0}</div>
    </div>

    <div className="stat-box cities">
      <div className="icon">
        <FaCity />
      </div>
      <h3>Cities Covered</h3>
      <div className="number">{stats.cities || 0}</div>
    </div>

    <div className="stat-box bookings">
      <div className="icon">
        <FaCalendarCheck />
      </div>
      <h3>Total Bookings</h3>
      <div className="number">{stats.bookings || 0}</div>
    </div>

    <div className="stat-box grounds">
      <div className="icon">
        <FaMapMarkerAlt />
      </div>
      <h3>Total Grounds</h3>
      <div className="number">{stats.grounds || 0}</div>
    </div>

    <div className="stat-box courts">
      <div className="icon">
        <FaBasketballBall />
      </div>
      <h3>Total Courts</h3>
      <div className="number">{stats.courts || 0}</div>
    </div>

    <div className="stat-box games">
      <div className="icon">
        <FaGamepad />
      </div>
      <h3>Total Games</h3>
      <div className="number">{stats.games || 0}</div>
    </div>
  </>
)}

{/* Optional: Vendor-specific stats only (if any) */}
{user.usertype === 'vendor' && (
  <>
    <div className="stat-box grounds">
      <div className="icon">
        <FaMapMarkerAlt />
      </div>
      <h3>Total Grounds</h3>
      <div className="number">{stats.grounds || 0}</div>
    </div>
    <div className="stat-box bookings">

      <div className="icon">
        <FaCalendarCheck />
      </div>
      <h3>Your Bookings</h3>
      <div className="number">{stats.vendorBookings || 0}</div>
    </div>

    <div className="stat-box courts">
      <div className="icon">
        <FaBasketballBall />
      </div>
      <h3>Your Courts</h3>
      <div className="number">{stats.courts || 0}</div>
    </div>
  </>
)}
</div>
</div>
  );
};

export default Dashboard; 