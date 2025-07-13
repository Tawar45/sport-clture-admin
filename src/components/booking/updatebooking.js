import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaGamepad, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../utils/api';
import './updatebooking.css';

const UpdateBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    ground_id: '',
    game_id: '',
    booking_date: '',
    slots: [], // Changed to array for multiple slots
    booking_type: 'online',
    payment_status: 'pending',
    payment_method: '',
    payment_reference: '',
    amount: '',
    status: 'pending'
  });

  const [users, setUsers] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBookingData();
  }, [id]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      
      // Fetch booking details
      const bookingResponse = await api.get(`/booking/${id}`);
      const bookingData = bookingResponse.data;
      
      // Parse slots from string to array
      const slotsArray = bookingData.slot ? bookingData.slot.split(', ').map(s => s.trim()) : [];
      
      setFormData({
        user_id: bookingData.user_id.toString(),
        ground_id: bookingData.ground_id.toString(),
        game_id: bookingData.game_id.toString(),
        booking_date: bookingData.booking_date,
        slots: slotsArray,
        booking_type: bookingData.booking_type,
        payment_status: bookingData.payment_status,
        payment_method: bookingData.payment_method || '',
        payment_reference: bookingData.payment_reference || '',
        amount: bookingData.amount.toString(),
        status: bookingData.status
      });

      // Fetch users
      const usersResponse = await api.get('/users/list');
      setUsers(usersResponse.data);

      // Fetch grounds
      const groundsResponse = await api.get('/ground/list');
      setGrounds(groundsResponse.data);

      // Fetch games
      const gamesResponse = await api.get('/games/list');
      setGames(gamesResponse.data);

    } catch (err) {
      console.error('Error fetching booking data:', err);
      setError('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSlotChange = (slot) => {
    setFormData(prev => {
      const currentSlots = [...prev.slots];
      if (currentSlots.includes(slot)) {
        // Remove slot if already selected
        return {
          ...prev,
          slots: currentSlots.filter(s => s !== slot)
        };
      } else {
        // Add slot if not selected
        return {
          ...prev,
          slots: [...currentSlots, slot]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate that at least one slot is selected
    if (formData.slots.length === 0) {
      setError('Please select at least one time slot');
      setSaving(false);
      return;
    }

    try {
      await api.put(`/booking/${id}`, {
        ...formData,
        slot: formData.slots.join(', ') // Convert array to string for API
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/booking-list');
      }, 2000);
    } catch (err) {
      setError('Failed to update booking');
      console.error('Error updating booking:', err);
    } finally {
      setSaving(false);
    }
  };

  // Generate 1-hour time slots from 6 AM to 10 PM
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    timeSlots.push(`${startTime}-${endTime}`);
  }

  if (loading) {
    return <div className="loading">Loading booking data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="update-booking-container">
      <div className="form-header">
        <h1>Update Booking #{id}</h1>
        <button 
          className="cancel-btn"
          onClick={() => navigate('/booking-list')}
        >
          <FaTimes /> Cancel
        </button>
      </div>

      {success && (
        <div className="success-message">
          Booking updated successfully! Redirecting to booking list...
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-grid">
          <div className="form-group">
            <label>
              <FaUser className="icon" />
              User
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
                  {user.name} ({user.email})
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

          <div className="form-group">
            <label>
              <FaGamepad className="icon" />
              Game
            </label>
            <select
              name="game_id"
              value={formData.game_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Game</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
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
            />
          </div>

          <div className="form-group full-width">
            <label>Time Slots (Select Multiple)</label>
            <div className="time-slots-grid">
              {timeSlots.map(slot => (
                <div 
                  key={slot} 
                  className={`time-slot ${formData.slots.includes(slot) ? 'selected' : ''}`}
                  onClick={() => handleSlotChange(slot)}
                >
                  {slot}
                </div>
              ))}
            </div>
            {formData.slots.length > 0 && (
              <div className="selected-slots">
                <strong>Selected Slots:</strong> {formData.slots.join(', ')}
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
            disabled={saving}
          >
            <FaSave />
            {saving ? 'Updating...' : 'Update Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBooking; 