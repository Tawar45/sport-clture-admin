import React, { useState, useEffect } from 'react';
import '../court.css';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api/court`;

const CourtList = () => {
  const { user } = useAuth();
  const [usertype, setUsertype] = useState(user.usertype);
  const [grounds, setGrounds] = useState([]);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const navigate = useNavigate();
  // ✅ Fetch grounds on mount
  useEffect(() => {
    fetchGrounds();
  }, []);
  // ✅ Set vendor_id to user.id if not admin

  const fetchGrounds = async () => {
    try {
      let response;
      if (usertype === 'admin') {
        response = await fetch(`${API_URL}/list`);
      } else {
        response = await fetch(`${API_URL}/list/${user.id}`);
      }
      if (!response.ok) throw new Error('Failed to fetch grounds');
      const data = await response.json();
      setGrounds(data.grounds);
    } catch (error) {
      setError('Error fetching grounds');
    }
  };

  // Handle form submissio  
  const handleEdit = (ground) => {

  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ground?')) {
      try {
        const response = await fetch(`${API_URL}/remove/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete ground');
        }
        fetchGrounds();
        setUpdateMessage('Court deleted successfully!');
      } catch (err) {
        setError('Error deleting ground');
      }
    }
  };

  const handleAddCourt = () => {
    navigate('/court/add');
  };

  return (
    <div className="grounds ground-container">
      {/* <h3>Manage Grounds</h3> */}
      <div className="ground-form-container">
        <h3>Manage Courts</h3>
        <button className="btn btn-primary" onClick={() => handleAddCourt()}>Add Court</button>
        <table className="table mt-4">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Game</th>
              <th>Price</th>
              <th>Status</th>
              <th>Time</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grounds.map(ground => (
              <tr key={ground.id}>
                <td>{ground.id}</td>
                <td>{ground.name}</td>
                <td>{ground.address}</td>
                <td>{ground.city}</td>
                <td>{ground.game}</td>
                <td>{ground.price}</td>
                <td>
                  <span className={`status-badge ${ground.status}`}>
                    {ground.status}
                  </span>
                </td>
                <td>
                  {ground.openTime} - {ground.closeTime}
                </td>
                <td>
                  <img 
                    src={ground.imageUrl} 
                    alt={ground.name} 
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                  />
                </td>
                <td>
                  <button 
                    className="btn btn-primary me-2" 
                    onClick={() => handleEdit(ground)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(ground.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  export default CourtList; 