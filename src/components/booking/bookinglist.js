import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaBasketballBall, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../utils/api';
import './bookinglist.css';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/booking/list');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleEditBooking = (booking) => {
    // Navigate to edit booking page
    window.location.href = `/update-booking/${booking.id}`;
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/booking/${bookingId}`);
        fetchBookings(); // Refresh the list
      } catch (err) {
        console.error('Error deleting booking:', err);
        alert('Failed to delete booking');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  // if (error) {
  //   return <div className="error">{error}</div>;
  // }

  return (
    <div className="booking-list-container">
      <div className="booking-header">
        <h1>Booking Management</h1>
        <button 
          className="add-booking-btn"
          onClick={() => window.location.href = '/add-booking'}
        >
          Add New Booking
        </button>
      </div>

      <div className="bookings-grid">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header-card">
              <h3>Booking #{booking.id}</h3>
              <div className="booking-status">
                <span className={`status-badge ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <span className={`payment-badge ${getPaymentStatusColor(booking.payment_status)}`}>
                  {booking.payment_status}
                </span>
              </div>
            </div>

            <div className="booking-details">
              <div className="detail-item">
                <FaCalendarAlt className="icon" />
                <span>{formatDate(booking.booking_date)}</span>
              </div>
              <div className="detail-item">
                <FaMapMarkerAlt className="icon" />
                <span>Ground ID: {booking.ground_id}</span>
              </div>
              <div className="detail-item">
                <FaBasketballBall className="icon" />
                <span>Game ID: {booking.game_id}</span>
              </div>
              <div className="detail-item">
                <FaUser className="icon" />
                <span>User ID: {booking.user_id}</span>
              </div>
              <div className="detail-item">
                <FaMoneyBillWave className="icon" />
                <span>₹{booking.amount}</span>
              </div>
              <div className="detail-item">
                <span>Slot: {booking.slot}</span>
              </div>
              <div className="detail-item">
                <span>Type: {booking.booking_type}</span>
              </div>
            </div>

            <div className="booking-actions">
              <button 
                className="action-btn view-btn"
                onClick={() => handleViewBooking(booking)}
              >
                <FaEye /> View
              </button>
              <button 
                className="action-btn edit-btn"
                onClick={() => handleEditBooking(booking)}
              >
                <FaEdit /> Edit
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDeleteBooking(booking.id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="no-bookings">
          <p>No bookings found</p>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Booking ID:</strong> {selectedBooking.id}
              </div>
              <div className="detail-row">
                <strong>User ID:</strong> {selectedBooking.user_id}
              </div>
              <div className="detail-row">
                <strong>Ground ID:</strong> {selectedBooking.ground_id}
              </div>
              <div className="detail-row">
                <strong>Game ID:</strong> {selectedBooking.game_id}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {formatDate(selectedBooking.booking_date)}
              </div>
              <div className="detail-row">
                <strong>Slot:</strong> {selectedBooking.slot}
              </div>
              <div className="detail-row">
                <strong>Type:</strong> {selectedBooking.booking_type}
              </div>
              <div className="detail-row">
                <strong>Amount:</strong> ₹{selectedBooking.amount}
              </div>
              <div className="detail-row">
                <strong>Payment Status:</strong> 
                <span className={`status-badge ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                  {selectedBooking.payment_status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Payment Method:</strong> {selectedBooking.payment_method || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> 
                <span className={`status-badge ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
              {selectedBooking.payment_reference && (
                <div className="detail-row">
                  <strong>Payment Reference:</strong> {selectedBooking.payment_reference}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="edit-btn"
                onClick={() => {
                  setShowModal(false);
                  handleEditBooking(selectedBooking);
                }}
              >
                Edit Booking
              </button>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList; 