import React, { useState, useEffect } from 'react';
import './amenities.css';

const API_URL = `${process.env.REACT_APP_API_URL}/api/amenities`;

const Amenities = () => {

  const [amenitiesName, setAmenitiesName] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  
  // ✅ Fetch cities on mount
  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const res = await fetch(`${API_URL}/list`);
      const data = await res.json();
      setAmenities(data.amenities);
    } catch (err) {
      setError('Failed to fetch cities');
    }
  };

  // ✅ Handle add / update
  const handleSubmit = async (e) => {
    setUpdateMessage('');
    e.preventDefault();
    setError('');

    if (!amenitiesName.trim()) {
      setError('Amenities name is required');
      return;
    }
    if (amenitiesName.length < 3) {
      setError('Amenities name must be at least 3 characters');
      return;
    }
    setLoading(true);

    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_URL}/update/${editId}` : API_URL+'/add';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: amenitiesName }),
      });

      if (!res.ok) throw new Error('API error');
      
      const data = await res.json(); // Parse response if needed      
      await fetchAmenities();
      setAmenitiesName('');
      setEditId(null);
      setUpdateMessage(data.message);
    } catch (err) {
      setError('Error saving city');
    } finally {
      setLoading(false);
      setUpdateMessage('');
    }
  };

  const handleEdit = (amenities) => {
    setAmenitiesName(amenities.name);
    setEditId(amenities.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this amenities?')) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/remove/${id}`, { method: 'DELETE' });
      await fetchAmenities();
    } catch {
      setError('Error deleting amenities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="city city-container">
      {/* <h3>Manage Cities</h3> */}
        <form onSubmit={handleSubmit} className="city-form">
          <div className="mb-3">
            <label for="exampleInputEmail1" className="form-label">Amenities</label>
            <input type="text" className="form-control" id="exampleInputEmail1"  placeholder="Enter amenities name"
                  value={amenitiesName}
                  onChange={(e) => setAmenitiesName(e.target.value)}
                  disabled={loading}/>
          </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {updateMessage && <div style={{ color: 'green' }}>{updateMessage}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
                  {editId ? 'Update' : 'Add'} Amenities
          </button>
        </form>             
        <table className="table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Handle</th>
                </tr>
              </thead>
              <tbody>
              {amenities.map(amenities => (
                <tr key={amenities.id}>
                  <th> {amenities.id}</th>
                  <td> {amenities.name}</td>
                  <td>
                    <button className="btn btn-primary me-4" onClick={() => handleEdit(amenities)}>Edit</button>
                     
                    <button className="btn btn-danger" onClick={() => handleDelete(amenities.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
    </div>
  );
};

export default Amenities;
