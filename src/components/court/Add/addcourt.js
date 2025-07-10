import React, { useState, useEffect } from 'react';
import '../court.css';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const AddCourt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usertype, setUsertype] = useState(user.usertype);
  const [usertypeList, setUsertypeList] = useState('vendor');
  const [grounds, setGrounds] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    ground_id: '',
    name: '',
    openTime: '',
    closeTime: '',
    price: '',
    game_id: '', // <-- add this
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
  // New: Store selected slots per day
  const [slotsPerDay, setSlotsPerDay] = useState(() => {
    const initial = {};
    day.forEach(d => { initial[d] = []; });
    return initial;
  });
  const [games, setGames] = useState([]);

  // Helper: Convert time string to minutes
  const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  // Helper: Convert minutes to time string
  const minutesToTime = (min) => {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return `${h}:${m}`;
  };
  // Generate 1-hour slots between open and close
  const getSlots = (open, close) => {
    if (!open || !close) return [];
    let slots = [];
    let start = timeToMinutes(open);
    let end = timeToMinutes(close);
    for (let t = start; t + 60 <= end; t += 60) {
      slots.push(`${minutesToTime(t)} - ${minutesToTime(t + 60)}`);
    }
    return slots;
  };
  // Status options
// ✅ Fetch grounds on mount
  useEffect(() => {
    fetchGrounds();
  }, []);

  const fetchGrounds = async () => {
    try {
      let response;
      if (usertype === 'admin') {
        response = await fetch(`${API_URL}/ground/list`);
      } else {
        response = await fetch(`${API_URL}/ground/list/${user.id}`);
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

  useEffect(() => {
    if (formData.ground_id) {
      fetchGames(formData.ground_id);
    } else {
      setGames([]);
    }
  }, [formData.ground_id]);

  const fetchGames = async (groundId) => {
    try {
      // Adjust the API endpoint as per your backend
      const response = await fetch(`${API_URL}/games/list/${groundId}`);
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      setGames([]);
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
      // Build the data object
      const submitData = {
        ...formData,
        slotsPerDay, // include the slots per day selection
      };
      const url = `${API_URL}/court/add`;
      const method = 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
      setSlotsPerDay(() => {
        const initial = {};
        day.forEach(d => { initial[d] = []; });
        return initial;
      });

      // Refresh grounds list
      fetchGrounds();
      setUpdateMessage(`Court ${courtId ? 'updated' : 'added'} successfully!`);
      setTimeout(() => navigate('/courtlist'), 1000);
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
          <div className="col-md-6">
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

          <div className="col-md-6">
            <label htmlFor="ground_id">Ground:</label>
            <select
              id="ground_id"
              name="ground_id"
              value={formData.ground_id}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">-- Select Ground --</option>
              {grounds?.map(ground => (
                <option key={ground.id} value={ground.id}>
                  {ground.name}
                </option>
              ))}
            </select>
          </div>


            <div className="col-md-6">
              <label htmlFor="game_id">Game:</label>
              <select
                id="game_id"
                name="game_id"
                value={formData.game_id}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={games.length === 0}
              >
                <option value="">-- Select Game --</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>


          <div className="col-md-6">
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

          <div className="col-md-6">
            <label htmlFor="closeTime">Closing Time:</label>
            <select
              id="closeTime"
              name="closeTime"
              value={formData.closeTime}
              onChange={handleInputChange}
              className="form-control"
              disabled={!formData.openTime} // Disable if no openTime
            >
              <option value="">-- Select Closing Time --</option>
              {/* Only show times at least 1 hour after openTime */}
              {closeTime.filter(time => {
                if (!formData.openTime) return true;
                return timeToMinutes(time) - timeToMinutes(formData.openTime) >= 60;
              }).map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
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
         <div className='col-md-12'>
         <ul className="nav nav-tabs">
        {day.map((day) => (
          <li className="nav-item" key={day}>
            <button 
              className={`nav-link ${activeTab === day ? 'active' : ''}`}
              onClick={e => { e.preventDefault(); setActiveTab(day); }}
            >
              {day}
            </button>
          </li>
        ))}
      </ul>
      </div> 

      <div className="tab-content p-3 border border-top-0">
        <div className="tab-pane fade show active">
          <h5>{activeTab}</h5>
          {/* Show 1-hour slots with checkboxes for the active day */}
          {formData.openTime && formData.closeTime ? (
            <div className="slots-list">
              {getSlots(formData.openTime, formData.closeTime).length === 0 ? (
                <p>No available 1-hour slots for selected times.</p>
              ) : (
                getSlots(formData.openTime, formData.closeTime).map(slot => (
                  <div key={slot} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`slot-${activeTab}-${slot}`}
                      checked={slotsPerDay[activeTab]?.includes(slot) || false}
                      onChange={e => {
                        setSlotsPerDay(prev => {
                          const updated = { ...prev };
                          if (e.target.checked) {
                            updated[activeTab] = [...(updated[activeTab] || []), slot];
                          } else {
                            updated[activeTab] = (updated[activeTab] || []).filter(s => s !== slot);
                          }
                          return updated;
                        });
                      }}
                    />
                    <label className="form-check-label" htmlFor={`slot-${activeTab}-${slot}`}>{slot}</label>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p>Select Opening and Closing Time to set available slots.</p>
          )}
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