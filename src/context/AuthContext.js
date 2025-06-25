// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅️ Add loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // simulate fetching user from token
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser(storedUser);
    }
    setLoading(false); // ⬅️ Set loading to false once checked
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', 'some-token');
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
