import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // BUG FIX: Always refresh user from server on app load.
      // This ensures that if admin approved the doctor WHILE the doctor was
      // logged in (or between sessions), the user object in state gets the
      // updated type='doctor' instead of the stale type='user' from localStorage.
      refreshUserFromServer();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch fresh user data from server and sync to localStorage + state
  const refreshUserFromServer = async () => {
    try {
      const response = await authService.getProfile();
      const freshUser = response.data.data.user;
      const doctorData = response.data.data.doctor;

      // Merge doctor status into user object so components can read it
      const mergedUser = {
        ...freshUser,
        doctorStatus: doctorData ? doctorData.status : null,
        token: localStorage.getItem('token') // preserve token
      };

      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
      fetchNotifications();
    } catch (error) {
      console.error('Error refreshing user from server:', error);
      // If refresh fails (e.g. token expired), clear and force re-login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await authService.getNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      // BUG FIX: After login, immediately fetch fresh profile from DB.
      // The login response gives us the JWT token with the current user type.
      // But if a doctor was approved BETWEEN logins, their new type='doctor'
      // will be returned by the login endpoint since adminController updates
      // the User document directly. So this is mostly a safety net.
      await refreshUserFromServer();

      toast.success('Login successful!');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      toast.success('Registration successful!');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications([]);
    toast.info('Logged out successfully');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const markNotificationRead = async (id) => {
    try {
      await authService.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const value = {
    user,
    loading,
    notifications,
    login,
    register,
    logout,
    updateUser,
    markNotificationRead,
    fetchNotifications,
    refreshUserFromServer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};