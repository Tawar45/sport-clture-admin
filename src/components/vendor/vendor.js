import React, { useState, useEffect } from 'react';
import './vendor.css';
import { useNavigate } from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const Vendor = () => {
  // State management
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
    usertype: 'vendor',
  });
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [usertype, setUsertype] = useState('vendor');
  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/list/${usertype}`);
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateMessage('');
    setError('');

    try {
      // Basic validation
      if (!formData.username || !formData.email || (!editId && !formData.password)) {
        setError('Please fill in all required fields');
        return;
      }

      setLoading(true);

      // Prepare data for submission (excluding profile_image)
      const submitData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        usertype: formData.usertype
      };

      const method = 'POST';
      const url =  API_URL+'/auth/register';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save user');
      }

      setUpdateMessage(data.message);
      await fetchUsers();
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        usertype: 'vendor',
        profile_image: null
      });
      setEditId(null);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/vendor/edit/${userId}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/users/remove/${id}`, { method: 'DELETE' });
      await fetchUsers();
    } catch {
      setError('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await fetch(`${API_URL}/users/toggle-status/${id}`, { method: 'PATCH' });
      await fetchUsers();
    } catch {
      setError('Error updating status');
    }
  };

  return (
    <div className="vendor-container">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{editId ? 'Edit' : 'Add'} Vendor</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email*</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password{!editId && '*'}</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {updateMessage && <div className="alert alert-success">{updateMessage}</div>}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : (editId ? 'Update' : 'Add')} Vendor
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Vendor List</h5>
              
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => 
                        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.phone_number || '-'}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={user.status}
                                onChange={() => handleToggleStatus(user.id, user.status)}
                              />
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => handleEdit(user.id)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(user.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendor;
