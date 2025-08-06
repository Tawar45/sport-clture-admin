import React, { useState, useEffect } from 'react';
import './ground.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate} from 'react-router-dom';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const GroundList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usertype, setUsertype] = useState(user.usertype);
  // const [usertypeList, setUsertypeList] = useState('vendor');
  const [grounds, setGrounds] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedGroundName, setSelectedGroundName] = useState('');
  // Status options
  const statusOptions = ['active', 'inactive', 'maintenance'];

  // ✅ Fetch grounds on mount
  useEffect(() => {
    fetchGrounds();
  }, []);
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

  const handleImageClick = (ground) => {
    if (ground.imageUrls && ground.imageUrls.length > 0) {
      setSelectedImages(ground.imageUrls);
      setSelectedGroundName(ground.name);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImages([]);
    setSelectedGroundName('');
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

  const handleAdd = () => {
    navigate('/ground/add');
  };
  const handleEdit = (court) => {
    navigate(`/ground/edit/${court.id}`);
  };

  return (
    <div className="grounds ground-container">
      {/* self */}
      <div className="d-flex align-item-center">
        <button
          className="btn btn-primary"
          onClick={() => handleAdd()}
          style={{
            width: "auto",
            padding: "8px 12px",
            fontSize: "1rem",
          }}
        >
          Add Ground
        </button>
      </div>
      {/* self */}
      <div className="ground-form-container">
        <table className="table mt-4">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Game</th>
              <th>Status</th>
              <th>Time</th>
              <th>Price</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grounds.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">
                  <div className="no-data-message">
                    <p>No grounds found</p>
                  </div>
                </td>
              </tr>
            ) : (
              grounds.map((ground) => (
                <tr key={ground.id}>
                  <td>{ground.id}</td>
                  <td>{ground.name}</td>
                  <td>{ground.address}</td>
                  <td>{ground.city}</td>
                  <td>
                    {ground.gameNames && ground.gameNames.length > 0 ? (
                      <div className="game-names">
                        {ground.gameNames.map((gameName, index) => (
                          <span key={index} className="game-name-badge">
                            {gameName.name},
                          </span>
                        ))}
                      </div>
                    ) : ground.gameName ? (
                      ground.gameName
                    ) : (
                      ground.game
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${ground.status}`}>
                      {ground.status}
                    </span>
                  </td>
                  <td>
                    {ground.openTime} - {ground.closeTime}
                  </td>
                  <td>{ground.price}</td>
                  <td>
                    {ground.imageUrls && ground.imageUrls.length > 0 ? (
                      <div className="ground-images">
                        <img
                          src={ground.imageUrls[0]}
                          alt={ground.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => handleImageClick(ground)}
                        />
                        {ground.imageUrls.length > 1 && (
                          <div className="image-count">
                            +{ground.imageUrls.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>No images</span>
                    )}
                  </td>

                  <td className="d-flex align-items-center">
                    <button
                      className="btn btn-primary me-2"
                      style={{
                        width: "80px",
                        padding: "8px 12px",
                        fontSize: "1rem",
                      }}
                      onClick={() => handleEdit(ground)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger"
                      style={{
                        width: "80px",
                        padding: "8px 12px",
                        fontSize: "1rem",
                      }}
                      onClick={() => handleDelete(ground.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Image Modal */}
      {showModal && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="image-modal-header">
              <h3>{selectedGroundName} - All Images</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="image-modal-body">
              <div className="image-gallery">
                {selectedImages.map((image, index) => (
                  <div key={index} className="gallery-image-container">
                    <img
                      src={image}
                      alt={`${selectedGroundName} - Image ${index + 1}`}
                      className="gallery-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundList; 