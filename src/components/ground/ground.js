import React, { useState, useEffect } from 'react';
import './ground.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate , useParams} from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const Ground = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [usertype, setUsertype] = useState(user.usertype);
  const [usertypeList, setUsertypeList] = useState('vendor');
  const openTime = [
    '08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'
  ];
  const closeTime = [...openTime];
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    games: [],       // Multiple games (new feature)
    status: 'active',
    description: '',
    openTime: '',
    closeTime: '',
    images: [],
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
  const [cities, setCities] = useState([]);
  const [games, setGames] = useState([]);
  // Status options
  const statusOptions = ['active', 'inactive', 'maintenance'];

  const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  // ✅ Fetch grounds on mount
  useEffect(() => {
    fetchVendors();
    fetchCities();
    fetchGames();
  }, []);

  // Fetch ground data when editing
  useEffect(() => {
    if (id) {
      setGroundId(id); // Set the groundId when editing
      fetchGroundById(id);
    }
  }, [id]);

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

  const fetchGroundById = async (id) => {
    try {
      const response = await fetch(`${API_URL}/ground/get/${id}`);
      if (!response.ok) throw new Error('Failed to fetch ground');
      const data = await response.json();
      const ground = data.ground;
      
      // Parse games array if it's a string
      let gamesArray = [];
      try {
        if (ground.games) {
          if (typeof ground.games === 'string') {
            gamesArray = JSON.parse(ground.games);
          } else if (Array.isArray(ground.games)) {
            gamesArray = ground.games;
          }
        }
      } catch (error) {
        console.error('Error parsing games:', error);
        gamesArray = [];
      }
      
      setFormData({
        name: ground.name,
        address: ground.address,
        city: ground.city,
        games: gamesArray, // Use parsed games array
        status: ground.status,
        description: ground.description,
        openTime: ground.openTime,
        closeTime: ground.closeTime,
        images: [], // Will be populated when new images are selected
        imagePreview: ground.imageUrls || [ground.imageUrl], // Show existing images
        fileName: ground.imageUrls ? `${ground.imageUrls.length} images` : '1 image',
        vendor_id: ground.vendor_id
      });
    } catch (error) {
      setError('Error fetching ground details');
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

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_URL}/city/list`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      setCities(data.cities || []);
    } catch (error) {
      setCities([]);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_URL}/games/list`);
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

  // Select all games
  const selectAllGames = () => {
    const allGameIds = games.map(game => parseInt(game.id)).sort((a, b) => a - b);
    console.log('Select all games:', allGameIds); // Debug log
    setFormData(prev => ({
      ...prev,
      games: allGameIds
    }));
  };

  // Clear all games
  const clearAllGames = () => {
    console.log('Clear all games'); // Debug log
    setFormData(prev => ({
      ...prev,
      games: [],

    }));
  };

  // Handle game selection for multiple games
  const handleGameSelection = (gameId) => {
    const gameIdNum = parseInt(gameId); // Ensure it's a number
    setFormData(prev => {
      const currentGames = [...prev.games];
      const index = currentGames.indexOf(gameIdNum);
      if (index > -1) {
        currentGames.splice(index, 1); // Remove if already selected
      } else {
        currentGames.push(gameIdNum); // Add if not selected
      }
      
      // Ensure games array contains only numbers and is sorted
      const sortedGames = currentGames
        .filter(id => !isNaN(id) && id > 0) // Filter out invalid IDs
        .sort((a, b) => a - b); // Sort numerically
      
      console.log('Games array updated:', sortedGames); // Debug log
      
      return {
        ...prev,
        games: sortedGames,
      };
    });
  };

  // Handle image change with validation for multiple images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    console.log('Selected files:', files.length, 'images');
    
    if (files.length > 0) {
      // Validate file types
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const invalidFiles = files.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setError('Please select valid image files (JPG, PNG, GIF)');
        return;
      }

      // Validate file sizes (5MB limit per file)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const oversizedFiles = files.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        setError('Each image size must be less than 5MB');
        return;
      }

      // Create previews
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: files,
        imagePreview: previewUrls,
        fileName: files.map(f => f.name).join(', ')
      }));
      setError('');
    }
  };

  // Clear images
  const handleClearImages = () => {
    setFormData(prev => ({
      ...prev,
      images: [],
      imagePreview: null,
      fileName: ''
    }));
  };

  // Remove specific image from the list
  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, index) => index !== indexToRemove);
      const newImagePreview = prev.imagePreview.filter((_, index) => index !== indexToRemove);
      const newFileName = newImages.map(f => f.name).join(', ');
      
      return {
        ...prev,
        images: newImages,
        imagePreview: newImagePreview,
        fileName: newFileName
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdateMessage('');
    setLoading(true);

    try {
      // Validate games array
      if (!formData.games || !Array.isArray(formData.games) || formData.games.length === 0) {
        setError('Please select at least one game');
        setLoading(false);
        return;
      }

      // Ensure games array contains only valid game IDs
      const validGames = formData.games
        .filter(id => !isNaN(id) && id > 0)
        .sort((a, b) => a - b);

      if (validGames.length === 0) {
        setError('Please select at least one valid game');
        setLoading(false);
        return;
      }

      console.log('Submitting games array:', validGames); // Debug log

      const submitData = new FormData();
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'imagePreview' && key !== 'fileName') {
          if (key === 'images' && formData[key] instanceof Array) {
            // Append multiple images
            formData[key].forEach(image => {
              submitData.append('images', image);
            });
          } else if (key === 'games') {
            // Append each game ID individually
            formData[key].forEach(gameId => {
              submitData.append('games[]', gameId);
            });
          } else if (key !== 'images') {
            submitData.append(key, formData[key]);
          }
        }
      });

      const url = groundId ? `${API_URL}/ground/update/${groundId}` : `${API_URL}/ground/add`;
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
        games: [],
        status: 'active',
        description: '',
        openTime: '',
        closeTime: '',
        images: [],
        imagePreview: null,
        fileName: '',
        vendor_id: null
      });
      setGroundId(null);
      // Refresh grounds list
      setUpdateMessage(`Ground ${groundId ? 'updated' : 'added'} successfully!`);
      setTimeout(() => navigate('/groundlist'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ground) => {
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
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">-- Select City --</option>
              {cities.map(city => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group games-form-group">
            <label htmlFor="games">Games (Multiple Selection):</label>
            <div className="games-controls">
              <button 
                type="button" 
                onClick={selectAllGames}
                className="btn btn-sm btn-outline-primary me-2"
              >
                Select All
              </button>
              <button 
                type="button" 
                onClick={clearAllGames}
                className="btn btn-sm btn-outline-secondary"
              >
                Clear All
              </button>
            </div>
            <div className="games-selection">
              {games.map(game => (
                <div key={game.id} className="game-checkbox">
                  <input
                    type="checkbox"
                    id={`game-${game.id}`}
                    checked={formData.games.includes(game.id)}
                    onChange={() => handleGameSelection(game.id)}
                    className="game-checkbox-input"
                  />
                  <label htmlFor={`game-${game.id}`} className="game-checkbox-label">
                    {game.name}
                  </label>
                </div>
              ))}
            </div>
            {formData.games.length > 0 && (
              <div className="selected-games">
                <strong>Selected Games:</strong> {formData.games.map(gameId => {
                  const game = games.find(g => g.id === gameId);
                  return game ? game.name : `Game ${gameId}`;
                }).join(', ')}
              </div>
            )}
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
            <label htmlFor="images">Ground Images:</label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/gif"
              multiple
              className="form-control"
              {...(!groundId && { required: true })}
            />
            {formData.fileName && (
              <div className="file-info">
                <span>{formData.fileName}</span>
                <button 
                  type="button" 
                  onClick={handleClearImages}
                  className="clear-btn"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {formData.imagePreview && (
            <div className="image-preview">
              {Array.isArray(formData.imagePreview) ? (
                formData.imagePreview.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} width={100} height={100} style={{ margin: '5px' }}/>
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <img src={formData.imagePreview} alt="Preview" width={100} height={100}/>
              )}
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

      </div>
    </div>
  );
};

export default Ground; 