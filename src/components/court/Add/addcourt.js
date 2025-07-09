import React, { useState, useEffect } from 'react';
import '../court.css';
import { useAuth } from '../../../context/AuthContext';
const API_URL = `${process.env.REACT_APP_API_URL}/api/ground`;

const AddCourt = () => {
  const { user } = useAuth();
  const [usertype, setUsertype] = useState(user.usertype);
  const [usertypeList, setUsertypeList] = useState('vendor');
  const [groundId, setGroundId] = useState(null);
  const [grounds, setGrounds] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    ground_id: '',
    name: '',
    openTime: '',
    closeTime: '',
    price: '',
  });
  const openTime = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];
  const closeTime = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];  
  const day = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const [activeTab, setActiveTab] = useState('Monday');

  const [courtId, setCourtId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  // Status options
// ✅ Fetch grounds on mount
  useEffect(() => {
    fetchGrounds();
  }, []);

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
      setVendors(data.vendors);
    } catch (error) {
      setError('Error fetching grounds');
    }
  };
  const fetchVendors = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/list/${usertypeList}`);
      if (!response.ok) throw new Error('Failed to fetch grounds');
      const data = await response.json();
      setVendors(data.users);
    } catch (error) {
      setError('Error fetching grounds');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdateMessage('');
    setLoading(true);

    try {
      const submitData = new FormData();
      // Append all form fields
      const url = `${API_URL}/add`;
      const method = 'POST';

      const response = await fetch(url, {
        method: method,
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.join(', '));
      }

      // Reset form and groundId
      setFormData({
        ground_id: '',
        name: '',
        openTime: '',
        closeTime: '',
        price: '',
      });
      setCourtId(null);

      // Refresh grounds list
      fetchGrounds();
      setUpdateMessage(`Court ${courtId ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="grounds ground-container">
      {/* <h3>Manage Grounds</h3> */}
      <div className="ground-form-container">
        <h2>{courtId ? 'Update Court' : 'Add New Court'}</h2>
        
        <form onSubmit={handleSubmit} className="ground-form">
          <div className="form-group">
            <label htmlFor="name">Court Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              minLength="3"
              className="form-control"
              placeholder="Enter court name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ground_id">Ground:</label>
            <select
              id="ground_id"
              name="ground_id"
              value={formData.ground_id}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">-- Select Ground --</option>
              {grounds.map(ground => (
                <option key={ground.id} value={ground.id}>
                  {ground.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="openTime">Opening Time:</label>
            <select
              id="openTime"
              name="openTime"
              value={formData.openTime}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">-- Select Opening Time --</option>
              {openTime.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="closeTime">Closing Time:</label>
            <select
              id="closeTime"
              name="closeTime"
              value={formData.closeTime}
              onChange={handleInputChange}
                  className="form-control"
            >
              <option value="">-- Select Closing Time --</option>
              {closeTime.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}  
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter price"
            />
          </div>
          <ul className="nav nav-tabs">
        {day.map((day) => (
          <li className="nav-item" key={day}>
            <button 
              className={`nav-link ${activeTab === day ? 'active' : ''}`}
              onClick={() => setActiveTab(day)}
            >
              {day}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content p-3 border border-top-0">
        <div className="tab-pane fade show active">
          <h5>{activeTab}</h5>
          <p>Content for {activeTab} goes here...</p>
        </div>
      </div>

          {error && <div className="error-message">{error}</div>}
          {updateMessage && <div className="success-message">{updateMessage}</div>}

          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Processing...' : (courtId ? 'Update Court' : 'Add Court')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddCourt; 