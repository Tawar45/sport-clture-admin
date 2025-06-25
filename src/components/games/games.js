import React, { useState, useEffect } from 'react';
import './games.css';

const API_URL = `${process.env.REACT_APP_API_URL}/api/games`;

const Games = () => {

  const [gameName, setGameName] = useState('');
  const [games, setGames] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [gameImage, setGameImage] = useState('');
  // ✅ Fetch games on mount
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API_URL}/list`);
      const data = await res.json();
      setGames(data.games);
    } catch (err) {
      setError('Failed to fetch games');
    }
  };

  // ✅ Handle add / update
  const handleSubmit = async (e) => {
    setUpdateMessage('');
    e.preventDefault();
    setError('');

    if (!gameName.trim()) {
      setError('Game name is required');
      return;
    }
    if (gameName.length < 3) {
      setError('Game name must be at least 3 characters');
      return;
    }
    setLoading(true);

    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_URL}/update/${editId}` : API_URL+'/add';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: gameName, image: gameImage  }),
      });

      if (!res.ok) throw new Error('API error');
      
      const data = await res.json(); // Parse response if needed      
      await fetchGames();
      setGameName('');
      setGameImage('');
        setEditId(null);
      setUpdateMessage(data.message);
    } catch (err) {
      setError('Error saving game');
    } finally {
      setLoading(false);
      setUpdateMessage('');
    }
  };

  const handleEdit = (game) => {
          setGameName(game.name);
          setGameImage(game.image);
            setEditId(game.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/remove/${id}`, { method: 'DELETE' });
      await fetchGames();
    } catch {
      setError('Error deleting game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="games game-container">
      <h3>Manage Games</h3>
        <form onSubmit={handleSubmit} className="game-form">
          <div className="mb-3">
              <label for="exampleInputEmail1" className="form-label">Game Name</label>
            <input type="text" className="form-control" id="exampleInputEmail1"  placeholder="Enter game name"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  disabled={loading}/>
          </div>
          <div className="mb-3">
              <label for="exampleInputEmail1" className="form-label">Game Image</label>
            <input type="text" className="form-control" id="exampleInputEmail1"  placeholder="Enter game image"
                  value={gameImage}
                  onChange={(e) => setGameImage(e.target.value)}
                  disabled={loading}/>
          </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {updateMessage && <div style={{ color: 'green' }}>{updateMessage}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
                  {editId ? 'Update' : 'Add'} Game
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
                      <td><img src={game.image} alt={game.name} style={{ width: '100px', height: '100px' }} /></td> 
                    <td>
                      <button className="btn btn-primary me-4" onClick={() => handleEdit(game)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(game.id)}>Delete</button>  
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
    </div>
  );
};

export default Games;