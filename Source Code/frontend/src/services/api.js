import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle different error statuses
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later');
          break;
        default:
          toast.error(error.response.data?.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection');
    } else {
      toast.error('An error occurred');
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  getNotifications: () => api.get('/auth/notifications'),
  markNotificationRead: (id) => api.put(`/auth/notifications/${id}`),
};

// Doctor services
export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  applyAsDoctor: (doctorData) => api.post('/doctors/apply', doctorData),
  updateProfile: (profileData) => api.put('/doctors/profile', profileData),
  getAppointments: () => api.get('/doctors/appointments/list'),
  updateAppointmentStatus: (id, status) => api.put(`/doctors/appointments/${id}`, { status }),
};

// Appointment services
export const appointmentService = {
  bookAppointment: (appointmentData, files) => {
  const formData = new FormData();
  
  // Append all fields to formData
  Object.keys(appointmentData).forEach(key => {
    if (key === 'timeSlot') {
      // Make sure timeSlot is a proper JSON string
      formData.append(key, appointmentData[key]);
    } else {
      formData.append(key, appointmentData[key]);
    }
  });
  
  // Append files if any
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('documents', file);
    });
  }
  
  // Log formData contents for debugging
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }
  
  return api.post('/appointments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
},
  getUserAppointments: () => api.get('/appointments/my-appointments'),
  cancelAppointment: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
};

// Admin services
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getDoctors: (status) => api.get('/admin/doctors', { params: { status } }),
  updateDoctorStatus: (id, data) => api.put(`/admin/doctors/${id}/status`, data),
  getAppointments: () => api.get('/admin/appointments'),
  getStats: () => api.get('/admin/stats'),
};

export default api;