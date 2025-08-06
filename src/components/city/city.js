import React, { useState, useEffect } from 'react';
import './city.css';

const API_URL = `${process.env.REACT_APP_API_URL}/api/city`;

const City = () => {

  const [cityName, setCityName] = useState('');
  const [cities, setCities] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  

  // ✅ Fetch cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_URL}/list`);
      const data = await res.json();
      setCities(data.cities);
    } catch (err) {
      setError('Failed to fetch cities');
    }
  };

  // ✅ Handle add / update
  const handleSubmit = async (e) => {
    setUpdateMessage('');
    e.preventDefault();
    setError('');

    if (!cityName.trim()) {
      setError('City name is required');
      return;
    }
    if (cityName.length < 3) {
      setError('City name must be at least 3 characters');
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
        body: JSON.stringify({ name: cityName }),
      });

      if (!res.ok) throw new Error('API error');
      
      const data = await res.json(); // Parse response if needed      
      await fetchCities();
      setCityName('');
      setEditId(null);
      setUpdateMessage(data.message);
    } catch (err) {
      setError('Error saving city');
    } finally {
      setLoading(false);
      setUpdateMessage('');
    }
  };

  const handleEdit = (city) => {
    setCityName(city.name);
    setEditId(city.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/remove/${id}`, { method: 'DELETE' });
      await fetchCities();
    } catch {
      setError('Error deleting city');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="city city-container">
      {/* <h3>Manage Cities</h3> */}


       <form className="row g-3 align-items-center">
            <div className="col-12" >
              <label for="exampleInputEmail1" className="form-label"> City</label>
            </div>
            <div className="col-8">
              <input type="text" className="form-control" id="exampleInputEmail1" placeholder="Enter City Name">
              </input>
            </div>
            <div className="col-4">
              {/* <button type="submit" className="btn btn-primary w-auto p-2"> Add City</button> */}
              <button type="submit" className="btn btn-primary me-2" style={{ width: 'auto', padding: '8px 8px', fontSize: '1rem' }} disabled={loading}>
                  {editId ? 'Update' : 'Add'} City </button>
            </div>
          </form>
          {/* sir ka */}
          {/* <form onSubmit={handleSubmit} className="city-form">
          
           <div className="mb-3"> 
             <label for="exampleInputEmail1" className="form-label">City</label>
            <input type="text" className="form-control" id="exampleInputEmail1"  placeholder="Enter city name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  disabled={loading}/>
          </div>
           
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {updateMessage && <div style={{ color: 'green' }}>{updateMessage}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
                  {editId ? 'Update' : 'Add'} City
          </button>
        </form>              */}
        <table className="table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Handle</th>
                </tr>
              </thead>
              <tbody>
              {cities.map(city => (
                <tr key={city.id}>
                  <th >{city.id}</th>
                  <td>{city.name}</td>
                  {/* <td className="d-flex align-items-center">
                   <button className="btn btn-primary me-3" onClick={() => handleEdit(city)}>Edit</button>
                     
                    <button className="btn btn-danger me-3" onClick={() => handleDelete(city.id)}>Delete</button> 
                  </td> */}

     <td className="d-flex align-items-center">
      <button className="btn btn-primary me-2" style={{ width: '90px', padding: '10px 12px', fontSize: '1rem' }}
    onClick={() => handleEdit(city)} >Edit </button>

  <button className="btn btn-danger me-2"  style={{ width: '90px', padding: '10px 12px', fontSize: '1rem' }}
    onClick={() => handleDelete(city.id)} > Delete </button>
</td>

                </tr>
              ))}
              </tbody>
            </table>
    </div>
  );
};

export default City;
