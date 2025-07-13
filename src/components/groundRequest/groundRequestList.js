import React, { useState, useEffect } from 'react';
import './groundRequest.css';
import { useAuth } from '../../context/AuthContext';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const GroundRequestList = () => {
  const { user } = useAuth();
  const [groundRequests, setGroundRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', admin_notes: '' });

  // Fetch ground requests
  const fetchGroundRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/groundRequest/list?status=${statusFilter}&page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ground requests');
      }

      const data = await response.json();
      setGroundRequests(data.data.requests);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      setError('Error fetching ground requests');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/groundRequest/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Update request status
  const updateStatus = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/groundRequest/update-status/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(statusForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setSuccess(`Request ${statusForm.status} successfully`);
      setShowStatusModal(false);
      setSelectedRequest(null);
      setStatusForm({ status: '', admin_notes: '' });
      fetchGroundRequests();
      fetchStats();
    } catch (error) {
      setError('Error updating status');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete request
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const response = await fetch(`${API_URL}/groundRequest/remove/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete request');
        }

        setSuccess('Request deleted successfully');
        fetchGroundRequests();
        fetchStats();
      } catch (error) {
        setError('Error deleting request');
        console.error('Error:', error);
      }
    }
  };

  // Handle status modal
  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setStatusForm({ status: request.status, admin_notes: request.admin_notes || '' });
    setShowStatusModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  useEffect(() => {
    fetchGroundRequests();
    fetchStats();
  }, [statusFilter, currentPage]);

  return (
    <div className="ground-request-container">
      <div className="ground-request-header">
        <h2>Ground Requests</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card approved">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-card rejected">
            <span className="stat-number">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="ground-request-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Ground Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Game Type</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groundRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    <div className="no-data-message">
                      <p>No ground requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                groundRequests.map(request => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{request.user_name}</div>
                        <div className="user-email">{request.user_email}</div>
                        {request.user_phone && (
                          <div className="user-phone">{request.user_phone}</div>
                        )}
                      </div>
                    </td>
                    <td>{request.ground_name}</td>
                    <td>{request.ground_address}</td>
                    <td>{request.ground_city}</td>
                    <td>{request.game_type}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{formatDate(request.requested_date)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => openStatusModal(request)}
                        >
                          <i className="fas fa-edit"></i> Update
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(request.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Request Status</h3>
              <button 
                className="modal-close"
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  className="form-control"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Admin Notes</label>
                <textarea 
                  value={statusForm.admin_notes}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  className="form-control"
                  rows="4"
                  placeholder="Add notes about this request..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={updateStatus}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundRequestList; 