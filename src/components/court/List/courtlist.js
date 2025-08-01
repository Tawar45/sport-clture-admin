import React, { useState, useEffect } from 'react';
import '../court.css';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api/court`;

const CourtList = () => {
  const { user } = useAuth();
  const [usertype] = useState(user.usertype);
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const response = await fetch(`${API_URL}/list`);
      if (!response.ok) throw new Error('Failed to fetch courts');
      const data = await response.json();
      setCourts(data);
    } catch (error) {
      setError('Error fetching courts');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        const response = await fetch(`${API_URL}/delete/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete court');
        }
        fetchCourts();
        setUpdateMessage('Court deleted successfully!');
      } catch (err) {
        setError('Error deleting court');
      }
    }
  };

  const handleAddCourt = () => {
    navigate('/court/add');
  };
  const handleEdit = (court) => {
    navigate(`/court/edit/${court.id}`);
  };
  return (
    <div className="grounds ground-container">
      <div className="ground-form-container">
        <h3>Manage Courts</h3>
        <button className="btn btn-primary" onClick={handleAddCourt}>Add Court</button>
        <table className="table mt-4">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Ground </th>
              <th>Price</th>
              <th>Games</th>
              <th>Time</th>
              <th>Slots (per day)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courts.map(court => (
              <tr key={court.id}>
                <td>{court.id}</td>
                <td>{court.name}</td>
                <td>{court?.ground?.name}</td>
                <td>{court.price}</td>
                <td>{court?.games?.name}</td>
                <td>{court.open_time} - {court.close_time}</td>
                <td>
                  {court.slotsPerDay &&
                    Object.entries(court.slotsPerDay).map(([day, slots]) =>
                      slots.length > 0 ? (
                        <div key={day}>
                          <strong>{day}:</strong> {slots.join(', ')}
                        </div>
                      ) : null
                    )
                  }
                </td>
                <td>
                  <button 
                    className="btn btn-primary me-2" 
                    onClick={() => handleEdit(court)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(court.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <div className="error-message">{error}</div>}
        {updateMessage && <div className="success-message">{updateMessage}</div>}
      </div>
    </div>
  );
};

export default CourtList; 