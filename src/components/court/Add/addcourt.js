import React, { useState, useEffect } from 'react';
import '../court.css';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
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
    games_id: '',
  });

  
  const openTime = ['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
  const closeTime = ['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
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
  // Initialize slotsPerDay properly
  const [slotsPerDay, setSlotsPerDay] = useState(() => {
    const initial = {};
    day.forEach(d => { 
      initial[d] = []; 
    });
    return initial;
  });
  const [games, setGames] = useState([]);
  const [gameCount, setGameCount] = useState(0);

  // Helper: Convert time string to minutes
  const timeToMinutes = (t) => {
    // Handle time format without colons: "08", "09", etc.
    const hours = parseInt(t);
    return hours * 60;
  };
  
  // Helper: Convert minutes to time string (just hour)
  const minutesToTime = (min) => {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    return h; // Return just the hour number
  };
  
  // Generate 1-hour slots between open and close
  const getSlots = (open, close) => {
    if (!open || !close) return [];
    let slots = [];
    let start = timeToMinutes(open);
    let end = timeToMinutes(close);
    for (let t = start; t + 60 <= end; t += 60) {
      const startTime = minutesToTime(t);
      const endTime = minutesToTime(t + 60);
      slots.push(`${startTime} - ${endTime}`);
    }
    return slots;
  };

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
      // setVendors(data.vendors);
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
      setGameCount(0);
    }
  }, [formData.ground_id]);

  const fetchGames = async (groundId) => {
    try {
      const response = await fetch(`${API_URL}/ground/games/${groundId}`);
      if (!response.ok) throw new Error('Failed to fetch grounds');
      const data = await response.json();
      console.log(data, 'data');
      setGames(data.games);
    } catch (error) {
      setGames([]);
      setGameCount(0);
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

  // Handle slot selection with better state management
  const handleSlotChange = (slot, dayName) => {
    console.log('handleSlotChange called:', slot, dayName); // Debug log
    setSlotsPerDay(prev => {
      const updated = { ...prev };
      const currentSlots = updated[dayName] || [];
      
      console.log('Current slots for', dayName, ':', currentSlots); // Debug log
      
      if (currentSlots.includes(slot)) {
        // Remove slot if already selected
        updated[dayName] = currentSlots.filter(s => s !== slot);
        console.log('Removing slot:', slot); // Debug log
      } else {
        // Add slot if not selected
        updated[dayName] = [...currentSlots, slot];
        console.log('Adding slot:', slot); // Debug log
      }
      
      console.log('Updated slots for', dayName, ':', updated[dayName]); // Debug log
      return updated;
    });
  };

  // Force re-render when slotsPerDay changes
  useEffect(() => {
    console.log('slotsPerDay updated:', slotsPerDay);
  }, [slotsPerDay]);

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
        games_id: '',
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
              required
            >
              <option value="">-- Select Ground --</option>
              {grounds?.map(ground => (
                <option key={ground.id} value={ground.id}>
                  {ground.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="games_id">
              Game: {gameCount > 0 && <span className="game-count">({gameCount} games available)</span>}
            </label>
            <select
              id="games_id"
              name="games_id"
              value={formData.games_id}
              onChange={handleInputChange}
              className="form-control"
              required
              disabled={games?.length === 0}
            >
              <option value="">-- Select Game --</option>
              {games?.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
            {games?.length === 0 && formData.ground_id && (
              <small className="text-muted">No games available for this ground</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="openTime">Opening Time:</label>
            <select
              id="openTime"
              name="openTime"
              value={formData.openTime}
              onChange={handleInputChange}
              className="form-control"
              required
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
              disabled={!formData.openTime}
              required
            >
              <option value="">-- Select Closing Time --</option>
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
              required
            />
          </div>

          <div className='form-group full-width'>
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
              {formData.openTime && formData.closeTime ? (
                <div className="slots-list">
                  {getSlots(formData.openTime, formData.closeTime).length === 0 ? (
                    <p>No available 1-hour slots for selected times.</p>
                  ) : (
                    <div className="slots-grid">
                      {getSlots(formData.openTime, formData.closeTime).map(slot => {
                        const currentSlots = slotsPerDay[activeTab] || [];
                        const isChecked = currentSlots.includes(slot);
                        
                        console.log(`Slot: ${slot}, Day: ${activeTab}, Checked: ${isChecked}`); // Debug log
                        
                        return (
                          <div key={`${activeTab}-${slot}`} className="slot-item">
                            <input
                              type="checkbox"
                              className="slot-checkbox"
                              id={`slot-${activeTab}-${slot}`}
                              checked={isChecked}
                              onChange={() => handleSlotChange(slot, activeTab)}
                            />
                            <label 
                              className="slot-label" 
                              htmlFor={`slot-${activeTab}-${slot}`}
                              onClick={() => handleSlotChange(slot, activeTab)}
                            >
                              {slot}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p>Select Opening and Closing Time to set available slots.</p>
              )}
              
              {/* Debug info - remove in production */}
          
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