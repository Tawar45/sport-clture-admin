import React, { useState, useEffect } from 'react';
import './ground.css';
import { useAuth } from '../../context/AuthContext';
const API_URL = `${process.env.REACT_APP_API_URL}/api/ground`;

const Ground = () => {
  const { user } = useAuth();
  const [usertype, setUsertype] = useState(user.usertype);
  const [usertypeList, setUsertypeList] = useState('vendor');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    game: '',
    price: '',
    status: 'active',
    description: '',
    openTime: '',
    closeTime: '',
    image: null,
    imagePreview: null,
    fileName: '',
    vendor_id: null
  });

  const [grounds, setGrounds] = useState([]);
  const [groundId, setGroundId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [vendors, setVendors] = useState([]);
  // Status options
  const statusOptions = ['active', 'inactive', 'maintenance'];

  // ✅ Fetch grounds on mount
  useEffect(() => {
    fetchGrounds();
    fetchVendors();
  }, []);
  // ✅ Set vendor_id to user.id if not admin

  useEffect(() => {
      if (usertype !== 'admin' && user?.id) {
      setFormData((prev) => ({
        ...prev,
        vendor_id: user.id,
      }));
    }
  }, [usertype, user]);

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

  // Handle image change with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: previewUrl,
        fileName: file.name
      }));
      setError('');
    }
  };

  // Clear image
  const handleClearImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null,
      fileName: ''
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
      Object.keys(formData).forEach(key => {
        if (key !== 'imagePreview' && key !== 'fileName') {
          if (key === 'image' && formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else if (key !== 'image') {
            submitData.append(key, formData[key]);
          }
        }
      });

      const url = groundId ? `${API_URL}/update/${groundId}` : `${API_URL}/add`;
      const method = groundId ? 'PUT' : 'POST';

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
        name: '',
        address: '',
        city: '',
        game: '',
        price: '',
        status: 'active',
        description: '',
        openTime: '',
        closeTime: '',
        image: null,
        imagePreview: null,
        fileName: '',
        vendor_id: null
      });
      setGroundId(null);

      // Refresh grounds list
      fetchGrounds();
      setUpdateMessage(`Ground ${groundId ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ground) => {
    setFormData({
      name: ground.name,
      address: ground.address,
      city: ground.city,
      game: ground.game,
      price: ground.price,
      status: ground.status,
      description: ground.description,
      openTime: ground.openTime,
      closeTime: ground.closeTime,
      image: null,
      imagePreview: ground.imageUrl,
      fileName: '',
      vendor_id: ground.vendor_id
    });
    setGroundId(ground.id);
    setError('');
    setUpdateMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ground?')) {
      try {
        const response = await fetch(`${API_URL}/remove/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete ground');
        }

        fetchGrounds();
        setUpdateMessage('Ground deleted successfully!');
      } catch (err) {
        setError('Error deleting ground');
      }
    }
  };

  return (
    <div className="grounds ground-container">
      {/* <h3>Manage Grounds</h3> */}
      <div className="ground-form-container">
        <h2>{groundId ? 'Update Ground' : 'Add New Ground'}</h2>
        
        <form onSubmit={handleSubmit} className="ground-form">
          <div className="form-group">
            <label htmlFor="name">Ground Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              minLength="3"
              className="form-control"
              placeholder="Enter ground name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="form-control"
              placeholder="Enter address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="form-control"
              placeholder="Enter city"
            />
          </div>

          <div className="form-group">
            <label htmlFor="game">Game:</label>
            <input
              type="text"
              id="game"
              name="game"
              value={formData.game}
              onChange={handleInputChange}
              required
              className="form-control"
              placeholder="Enter game type"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price:</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              className="form-control"
              placeholder="Enter price"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>


          <div className="form-group">
            <label htmlFor="openTime">Opening Time:</label>
            <input
              type="text"
              id="openTime"
              name="openTime"
              value={formData.openTime}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="closeTime">Closing Time:</label>
            <input
              type="text"
              id="closeTime"
              name="closeTime"
              value={formData.closeTime}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
          {usertype === 'admin' ? (
          <div className="form-group">
            <label htmlFor="vendor_id">Vendor:</label>
            <select
              id="vendor_id"
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleInputChange}
              className="form-control"
            >
            <option value="">-- Select Vendor --</option> {/* default option */}
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.username}
                </option>
              ))}
            </select>
          </div>
            ) : (   
              <input
                type="hidden"
                name="vendor_id"
                value={user.id}   
                
                onChange={handleInputChange}              
                readOnly
              />
            )}
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="form-control"
              rows="4"
              placeholder="Enter description"
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Ground Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/gif"
              className="form-control"
              {...(!groundId && { required: true })}
            />
            {formData.fileName && (
              <div className="file-info">
                <span>{formData.fileName}</span>
                <button 
                  type="button" 
                  onClick={handleClearImage}
                  className="clear-btn"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {formData.imagePreview && (
            <div className="image-preview">
              <img src={formData.imagePreview} alt="Preview" width={100} height={100}/>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {updateMessage && <div className="success-message">{updateMessage}</div>}

          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Processing...' : (groundId ? 'Update Ground' : 'Add Ground')}
          </button>
        </form>

        <table className="table mt-4">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Game</th>
              <th>Price</th>
              <th>Status</th>
              <th>Time</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grounds.map(ground => (
              <tr key={ground.id}>
                <td>{ground.id}</td>
                <td>{ground.name}</td>
                <td>{ground.address}</td>
                <td>{ground.city}</td>
                <td>{ground.game}</td>
                <td>{ground.price}</td>
                <td>
                  <span className={`status-badge ${ground.status}`}>
                    {ground.status}
                  </span>
                </td>
                <td>
                  {ground.openTime} - {ground.closeTime}
                </td>
                <td>
                  <img 
                    src={ground.imageUrl} 
                    alt={ground.name} 
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                  />
                </td>
                <td>
                  <button 
                    className="btn btn-primary me-2" 
                    onClick={() => handleEdit(ground)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(ground.id)}
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
  );
};

export default Ground; 