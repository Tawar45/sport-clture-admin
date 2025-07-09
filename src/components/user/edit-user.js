import React, { useState, useEffect } from 'react';
import './user.css';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    usertype: 'user',
    profile_image: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/get/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user data');
      }

      // Set form data with user data
      setFormData({
        username: data.user.username || '',
        email: data.user.email || '',
        phone_number: data.user.phone_number || '',
        usertype: data.user.usertype || 'user',
        profile_image: null // Will be handled separately
      });

      // Set image preview if exists
      if (data.user.profile_image) {
        setImagePreview(`${data.user.profile_image}`);
      }

    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profile_image') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          profile_image: file
        }));
        
        // Create preview URL for image
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateMessage('');
    setError('');

    try {
      setLoading(true);

      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('usertype', formData.usertype);
      
    
      // Only append image if a new one is selected
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }

      const response = await fetch(`${API_URL}/users/update/${id}`, {
        method: 'PUT',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUpdateMessage('Profile updated successfully');
      
      // Navigate back after successful update
      setTimeout(() => {
        navigate('/user');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Error updating profile');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Edit User</h5>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/user')}
          >
            Back to List
          </button>
        </div>
        <div className="card-body">
          {loading && <div className="alert alert-info">Loading...</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {updateMessage && <div className="alert alert-success">{updateMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Profile Image</label>
              <input
                type="file"
                className="form-control"
                name="profile_image"
                onChange={handleInputChange}
                accept="image/*"
                disabled={loading}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Profile Preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }} 
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Username*</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                required
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
                required
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

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/user')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
