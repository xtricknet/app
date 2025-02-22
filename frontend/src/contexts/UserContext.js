// UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    tradedAmount: 0,
    reward: 0,
    avatar: '',
    payInTransactions: 0,
    payOutTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('token'); 
        navigate('/login');
        window.location.reload();
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      setUserData({
        username: data.username || 'user1',
        tradedAmount: data.balance || 0,
        reward: data.reward || 0,
        avatar: data.avatar || `https://i.ibb.co/c655HzS/androgynous-avatar-non-binary-queer-person.jpg`,
        payInTransactions: data.payInTransactions || 0,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      alert('Failed to fetch user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    userData,
    loading,
    showSensitiveData,
    setShowSensitiveData,
    fetchUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};