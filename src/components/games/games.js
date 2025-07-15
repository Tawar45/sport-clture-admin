import React, { useState, useEffect, useRef } from 'react';
import './games.css';

const API_URL = `${process.env.REACT_APP_API_URL}/api/games`;

const Games = () => {

  const [gameName, setGameName] = useState('');
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [gameImage, setGameImage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: null,
    fileName: ''
  });
  const fileInputRef = useRef(null);

  // ✅ Fetch games on mount
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_URL}/list`);
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      console.log(data,'data');
      setGames(data.games);
    } catch (error) {
      setError('Error fetching games');
    }
  };

  // ✅ Handle add / update
  const handleSubmit = async (e) => {
    setUpdateMessage('');
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Game name is required');
      return;
    }
    if (formData.name.length < 3) {
      setError('Game name must be at least 3 characters');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      if (formData.image instanceof File) {
        submitData.append('image', formData.image);
      }

      const url = gameId ? `${API_URL}/update/${gameId}` : `${API_URL}/add`;
      const method = gameId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${gameId ? 'update' : 'add'} game`);
      }

      // Reset form and gameId
      setFormData({
        name: '',
        description:'',
        image: null,
        imagePreview: null,
        fileName: ''
      });
      setGameId(null);

      // Clear file input after submit
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh games list
      fetchGames();
      setUpdateMessage(`Game ${gameId ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (game) => {
    setFormData({
      name: game.name,
      description:game.description,
      image: null,  // Reset image since we don't want to send the URL as file
      imagePreview: game.imageUrl,
      fileName: ''  // Reset filename since we don't have the original filename
    });
    setGameId(game.id);
    setError('');  // Clear any existing errors
    setUpdateMessage('');  // Clear any existing messages
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        const response = await fetch(`${API_URL}/remove/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete game');
        }

        fetchGames();
        setUpdateMessage('Game deleted successfully!');
      } catch (err) {
        setError('Error deleting game');
      }
    }
  };

  // Handle name change
  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      name: e.target.value
    });
  };
  const handleDescriptionChange = (e) => {
    setFormData({
      ...formData,
      description: e.target.value
    });
  };
  
  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: file,
        imagePreview: previewUrl,
        fileName: file.name
      });
      setError('');
    }
  };

  // Clear image
  const handleClearImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: null,
      fileName: ''
    });
  };

  return (
    <div className="games game-container">
      {/* <h3>Manage Games</h3> */}
      <div className="game-form-container">
        <h2>{gameId ? 'Update Game' : 'Add New Game'}</h2>
        
        <form onSubmit={handleSubmit} className="game-form">
          <div className="form-group">
            <label htmlFor="name">Game Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
              className="form-control"
              rows={4} // optional: sets height
             />
          </div>

          <div className="form-group">
            <label htmlFor="image">Game Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="form-control"
              ref={fileInputRef}
              {...(!gameId && { required: true })}
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

          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={loading || !formData.name || (!formData.image && !formData.imagePreview && !gameId)}>
            {loading ? 'Adding...' : (gameId ? 'Update Game' : 'Add Game')}
          </button>
        </form>
        <table className="table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Image</th>
              <th>Handle</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <th >{game.id}</th>
                <td>{game.name}</td>
                <td><img src={game.imageUrl} alt={game.name} style={{ width: '100px', height: '100px' }} /></td> 
                <td>
                  <button className="btn btn-primary me-4" onClick={() => handleEdit(game)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(game.id)}>Delete</button>  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Games;