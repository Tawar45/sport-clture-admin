import React, { useState, useEffect } from 'react';
import { FaUsers, FaStore, FaCity, FaCalendarCheck } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    vendors: 0,
    cities: 0,
    bookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // try {
      //   setLoading(true);
      //   const response = await axios.get('/api/dashboard/stats');
      //   setStats(response.data);
      //   setError(null);
      // } catch (err) {
      //   setError('Failed to load dashboard statistics');
      //   console.error('Error fetching dashboard stats:', err);
      // } finally {
      //   setLoading(false);
      // }
      setStats({
        users: 5,
        vendors: 5,
        cities: 3,
        bookings: 10
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard statistics...</div>;
  }

  // if (error) {
  //   return <div className="error">{error}</div>;
  // }

  return (
    <div className="dashboard dashboard-container">
      <h1>Dashboard</h1>
      <div className="stats-grid">
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
          <div className="number">{stats.bookings}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 