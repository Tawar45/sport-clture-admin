import React, { useEffect, useState } from 'react';
import './volunteer.css';
const API_URL = process.env.REACT_APP_API_URL;

const Volunteer = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/volunteer/list`);
        if (!response.ok) throw new Error('Failed to fetch volunteers');
        const data = await response.json();
        setVolunteers(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch volunteers');
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  if (loading) return <div>Loading volunteers...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="volunteer volunteer-container">
      <h2>Volunteer List</h2>
      <div className="volunteer-form-container">
      <table className="table mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Area of Interest</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v) => (
            <tr key={v.id}>
              <td>{v.name}</td>
              <td>{v.email}</td>
              <td>{v.phone}</td>
              <td>{v.city}</td>
              <td>{v.area_of_interest || '-'}</td>
              <td>{v.message || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Volunteer; 