import React, { useState, useEffect } from 'react';

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import './report.css';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// Dummy data for demonstration

const Report = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usertype, setUsertype] = useState('user');

  useEffect(() => {
    fetchBookings();
    fetchUsers();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/booking/list`);
      if (!response.ok) throw new Error('Failed to fetch courts');
      const data = await response.json();
      setBookings(data.data);
    } catch (error) {
      setError('Error fetching courts');
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/list/${usertype}`);
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };
  const handleDownload = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
  };

  return (
    <div className="report-container">
      <h2>Report</h2>
      <div className="report-tabs">
        <button className={`report-tab${activeTab === "bookings" ? " active" : ""}`} onClick={() => setActiveTab("bookings")}>Booking List</button>
        <button className={`report-tab${activeTab === "users" ? " active" : ""}`} onClick={() => setActiveTab("users")}>Users List</button>
        <button className={`report-tab${activeTab === "others" ? " active" : ""}`} onClick={() => setActiveTab("others")}>Other</button>
      </div>
      <div className="report-section">
        {activeTab === "bookings" && (
          <div>
            <h3>Booking List</h3>
            <button className="report-download-btn" onClick={() => handleDownload(bookings, "bookings.xlsx")}>Download Excel</button>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Booking Id</th>
                  <th>Date</th>
                  <th>Groud Name</th>
                  <th>Game Name</th>
                  <th>Time Slot</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b?.id}>
                    <td>{b?.id}</td>
                    <td>{b?.booking_date}</td>
                    <td>{b?.ground?.name}</td>
                    <td>{b?.game?.name}</td>
                    <td>{b?.slot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "users" && (
          <div>
            <h3>Users List</h3>
            <button className="report-download-btn" onClick={() => handleDownload(users, "users.xlsx")}>Download Excel</button>
            <table className="report-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.phone_number || '-'}</td>
                        </tr>
                    ))}
                  </tbody>
            </table>
          </div>
        )}
        {activeTab === "others" && (
          <div>
            <h3>  Upcoming Report </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report; 