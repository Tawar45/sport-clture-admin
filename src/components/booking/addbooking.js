import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaGamepad, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../utils/api';
import './addbooking.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate} from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// Add this function to get day name from date
const getDayFromDate = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Add this function to filter slots by selected date
const getFilteredSlots = (selectedCourt, selectedDate) => {
  if (!selectedCourt || !selectedDate) return {};
  
  const selectedDay = getDayFromDate(selectedDate);
  const allSlots = selectedCourt.slotsPerDay || {};
  
  // Return only slots for the selected day
  return {
    [selectedDay]: allSlots[selectedDay] || []
  };
};

const AddBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_id: '',
    user_type: 'user', // Add user_type field
    username: '', // Add username field
    email: '', // Add email field
    phone: '', // Add phone field
    vendor_id: '', // Add vendor_id field
    ground_id: '',
    court_id: '',
    game_id: '',
    booking_date: '',
    slots: [],
    booking_type: 'online',
    payment_status: 'pending',
    payment_method: '',
    payment_reference: '',
    amount: '',
    status: 'pending'
  });
  const [usertype, setUsertype] = useState(user.usertype);
  const [users, setUsers] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [courts, setCourts] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [usertypeList, setUsertypeList] = useState('user');
  const [activeTab, setActiveTab] = useState('Monday');

  useEffect(() => {
    fetchGrounds();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (courts.length > 0 && formData.court_id) {
      const selectedCourt = courts.find(court => court.id === parseInt(formData.court_id));
      if (selectedCourt && selectedCourt.slotsPerDay) {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const availableDays = dayOrder.filter(day => 
          selectedCourt.slotsPerDay[day] && selectedCourt.slotsPerDay[day].length > 0
        );
        
        if (availableDays.length > 0 && !availableDays.includes(activeTab)) {
          setActiveTab(availableDays[0]);
        }
      }
    }
  }, [courts, formData.court_id, activeTab]);
  // ✅ Set vendor_id to user.id if not admin

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

  // Add new function to fetch courts by ground ID
  const fetchCourtsByGround = async (groundId) => {
    try {
      const response = await fetch(`${API_URL}/ground/courts/${groundId}`);
      if (!response.ok) throw new Error('Failed to fetch courts');
      const data = await response.json();
      setCourts(data.courts || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
      setCourts([]);
    }
  };

  // Update the handleInputChange function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If user_type changes, reset user-related fields
    if (name === 'user_type') {
      setFormData(prev => ({
        ...prev,
        user_id: '',
        username: '',
        email: '',
        phone: ''
      }));
    }

    // If user_id is selected (for existing users), populate user details
    if (name === 'user_id' && value) {
      const selectedUser = users.find(user => user.id === parseInt(value));
      if (selectedUser) {
        setFormData(prev => ({
          ...prev,
          username: selectedUser.username || '',
          email: selectedUser.email || '',
          phone: selectedUser.phone || ''
        }));
      }
    }

    // If ground is selected, fetch courts for that ground
    if (name === 'ground_id' && value) {
      fetchCourtsByGround(value);
      setFormData(prev => ({
        ...prev,
        court_id: '',
        game_id: '',
        amount: '',
        slots: []
      }));
    }

    // If court is selected, auto-populate all data
    if (name === 'court_id' && value) {
      const selectedCourt = courts.find(court => court.id === parseInt(value));
      if (selectedCourt) {
        const courtPrice = parseFloat(selectedCourt.price);
        const gameId = selectedCourt.game ? selectedCourt.game.id : '';
        
        setFormData(prev => ({
          ...prev,
          game_id: gameId,
          amount: courtPrice.toFixed(2),
          slots: []
        }));
      }
    }

    // If booking date changes, reset slots and update active tab
    if (name === 'booking_date' && value) {
      const selectedDay = getDayFromDate(value);
      setActiveTab(selectedDay);
      setFormData(prev => ({
        ...prev,
        slots: []
      }));
    }
  };

  // Add new function to handle slot changes with auto-calculation
  const handleSlotChange = (slot, day) => {
    setFormData(prev => {
      const currentSlots = [...prev.slots];
      let newSlots;
      
      if (currentSlots.includes(slot)) {
        // Remove slot if already selected
        newSlots = currentSlots.filter(s => s !== slot);
      } else {
        // Add slot if not selected
        newSlots = [...currentSlots, slot];
      }

      // Auto-calculate amount based on selected slots and court price
      const selectedCourt = courts.find(court => court.id === parseInt(prev.court_id));
      let newAmount = 0;
      
      if (selectedCourt && newSlots.length > 0) {
        const courtPrice = parseFloat(selectedCourt.price);
        newAmount = courtPrice * newSlots.length;
      }

      return {
        ...prev,
        slots: newSlots,
        amount: newAmount.toFixed(2)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate that at least one slot is selected
    if (formData.slots.length === 0) {
      setError('Please select at least one time slot');
      setLoading(false);
      return;
    }

    // Validate user type and required fields
    if (formData.user_type === 'user' && !formData.user_id) {
      setError('Please select a user');
      setLoading(false);
      return;
    }

    if (formData.user_type === 'guest' && (!formData.username || !formData.email || !formData.phone)) {
      setError('Please fill in all guest user details');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/booking/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slot: formData.slots.join(', ') // Convert array to string for API
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      setSuccess(true);
      setFormData({
        user_id: '',
        user_type: 'user',
        username: '',
        email: '',
        phone: '',
        vendor_id: '',
        ground_id: '',
        court_id: '',
        game_id: '',
        booking_date: '',
        slots: [],
        booking_type: 'online',
        payment_status: 'pending',
        payment_method: '',
        payment_reference: '',
        amount: '',
        status: 'pending'
      });

      navigate('/bookinglist');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to create booking');
      } else {
        setError(err.message || 'Failed to create booking');
      }
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-booking-container">
      <div className="form-header">
        <h1>Add New Booking</h1>
        <button 
          className="cancel-btn"
          onClick={() => window.location.href = '/booking-list'}
        >
          <FaTimes /> Cancel
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Booking created successfully! Redirecting to booking list...
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-grid">
          {/* User Type Selection */}
          <div className="form-group">
            <label>
              <FaUser className="icon" />
              User Type
            </label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleInputChange}
              required
            >
              <option value="user">Registered User</option>
              <option value="guest">Guest User</option>
            </select>
          </div>

          {/* Existing User Selection (only show for registered users) */}
          {formData.user_type === 'user' && (
            <div className="form-group">
              <label>
                <FaUser className="icon" />
                Select User
              </label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Guest User Fields (only show for guest users) */}
          {formData.user_type === 'guest' && (
            <>
              <div className="form-group">
                <label>
                  <FaUser className="icon" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaUser className="icon" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaUser className="icon" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </>
          )}
          
          {/* Vendor ID field */}
          <div className="form-group">
            <label>
              <FaUser className="icon" />
              Vendor
            </label>
            <select
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.username} ({vendor.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              <FaMapMarkerAlt className="icon" />
              Ground
            </label>
            <select
              name="ground_id"
              value={formData.ground_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Ground</option>
              {grounds.map(ground => (
                <option key={ground.id} value={ground.id}>
                  {ground.name} - {ground.city}
                </option>
              ))}
            </select>
          </div>

          {/* Court selection */}
          <div className="form-group">
            <label>
              <FaGamepad className="icon" />
              Court
            </label>
            <select
              name="court_id"
              value={formData.court_id}
              onChange={handleInputChange}
              required
              disabled={!formData.ground_id}
            >
              <option value="">Select Court</option>
              {courts.map(court => (
                <option key={court.id} value={court.id}>
                  {court.name} - ₹{court.price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaGamepad className="icon" />
              Game
            </label>
            <select
              name="game_id"
              value={formData.game_id}
              onChange={handleInputChange}
              disabled={!formData.court_id}
            >
              <option value="">Select Game</option>
              {(() => {
                const selectedCourt = courts.find(court => court.id === parseInt(formData.court_id));
                if (selectedCourt && selectedCourt.game) {
                  return (
                    <option key={selectedCourt.game.id} value={selectedCourt.game.id}>
                      {selectedCourt.game.name}
                    </option>
                  );
                }
                return null;
              })()}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaCalendarAlt className="icon" />
              Booking Date
            </label>
            <input
              type="date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group full-width">
            <label>Time Slots (Select Multiple)</label>
            
            <div className="days-tabs-container">
              {(() => {
                const selectedCourt = courts.find(court => court.id === parseInt(formData.court_id));
                if (selectedCourt && selectedCourt.slotsPerDay) {
                  // If booking date is selected, filter slots by that day
                  let availableSlots = {};
                  let availableDays = [];
                  
                  if (formData.booking_date) {
                    // Filter slots based on selected date
                    availableSlots = getFilteredSlots(selectedCourt, formData.booking_date);
                    const selectedDay = getDayFromDate(formData.booking_date);
                    availableDays = availableSlots[selectedDay] && availableSlots[selectedDay].length > 0 ? [selectedDay] : [];
                  } else {
                    // Show all available days if no date selected
                    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    availableDays = dayOrder.filter(day => 
                      selectedCourt.slotsPerDay[day] && selectedCourt.slotsPerDay[day].length > 0
                    );
                    availableSlots = selectedCourt.slotsPerDay;
                  }
                  
                  if (availableDays.length === 0) {
                    return (
                      <div className="no-slots">
                        <p>
                          {formData.booking_date 
                            ? `No time slots available for ${getDayFromDate(formData.booking_date)} (${formData.booking_date})`
                            : 'No time slots available for this court'
                          }
                        </p>
                      </div>
                    );
                  }
                  
                  // Set initial active tab if not set or if current active tab is not available
                  if (!availableDays.includes(activeTab)) {
                    setActiveTab(availableDays[0]);
                  }
                  
                  return (
                    <div className="tabs-wrapper">
                      {/* Show date info if date is selected */}
                      {formData.booking_date && (
                        <div className="date-info">
                          <strong>Selected Date:</strong> {formData.booking_date} ({getDayFromDate(formData.booking_date)})
                        </div>
                      )}
                      
                      {/* Day Tabs - Only show if no date is selected or show single day if date is selected */}
                      {!formData.booking_date && (
                        <div className="day-tabs">
                          {availableDays.map((day) => (
                            <button
                              key={day}
                              className={`day-tab ${activeTab === day ? 'active' : ''}`}
                              onClick={() => setActiveTab(day)}
                              data-day={day}
                            >
                              {day}
                              <span className="tab-slot-count">
                                {availableSlots[day].length}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Tab Content */}
                      <div className="tab-content">
                        {availableDays.map((day) => (
                          <div 
                            key={day}
                            className={`tab-panel ${activeTab === day ? 'active' : ''}`}
                            data-day={day}
                          >
                            <div className="day-header">
                              <h4 className="day-title">
                                {day} 
                                <span className="slot-count">({availableSlots[day].length} slots)</span>
                              </h4>
                            </div>
                            
                            <div className="time-slots-grid">
                              {availableSlots[day].map((slotData, slotIndex) => {
                                // Handle both string slots and object slots
                                const slotValue = typeof slotData === 'string' ? slotData : slotData.slot;
                                const slotId = typeof slotData === 'string' ? `${day}-${slotValue}` : `${day}-${slotData.id}`;
                                
                                return (
                                  <div 
                                    key={slotId} 
                                    className={`time-slot ${formData.slots.includes(slotValue) ? 'selected' : ''}`}
                                    onClick={() => handleSlotChange(slotValue, day)}
                                    title={`${day} - ${slotValue}`}
                                  >
                                    <span className="slot-time">{slotValue}</span>
                                    {typeof slotData === 'object' && slotData.id && (
                                      <span className="slot-id">#{slotData.id}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="day-summary">
                              <small>
                                Available: {availableSlots[day].length} slots | 
                                Selected: {formData.slots.filter(slot => 
                                  availableSlots[day].some(daySlot => 
                                    (typeof daySlot === 'string' ? daySlot : daySlot.slot) === slot
                                  )
                                ).length} slots
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="no-slots">
                    <p>No time slots available for this court</p>
                  </div>
                );
              })()}
            </div>

            {formData.slots.length > 0 && (
              <div className="selected-slots">
                <strong>Selected Slots:</strong> {formData.slots.join(', ')}
                <br />
                <strong>Total Amount:</strong> ₹{formData.amount}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Booking Type</label>
            <select
              name="booking_type"
              value={formData.booking_type}
              onChange={handleInputChange}
              required
            >
              <option value="online">Online</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaMoneyBillWave className="icon" />
              Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>

          <div className="form-group">
            <label>Payment Status</label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleInputChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
            >
              <option value="">Select Payment Method</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          <div className="form-group">
            <label>Payment Reference</label>
            <input
              type="text"
              name="payment_reference"
              value={formData.payment_reference}
              onChange={handleInputChange}
              placeholder="Transaction ID or receipt number"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            <FaSave />
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBooking; 