import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  verify: (data) => API.post('/auth/verify', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data)
};

export const slotAPI = {
  getAll: (params) => API.get('/slots', { params }),
  getAvailable: (params) => API.get('/slots/available', { params }),
  getById: (id) => API.get(`/slots/${id}`)
};

export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: (params) => API.get('/bookings/my', { params }),
  getActive: () => API.get('/bookings/active'),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
  getAll: (params) => API.get('/bookings', { params })
};

export const staffAPI = {
  getActiveBookings: (params) => API.get('/staff/active-bookings', { params }),
  checkIn: (bookingId, data) => API.post(`/staff/checkin/${bookingId}`, data),
  checkOut: (bookingId, data) => API.post(`/staff/checkout/${bookingId}`, data),
  searchVehicle: (vehicleNumber) => API.get('/staff/search', { params: { vehicleNumber } })
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  createUser: (data) => API.post('/admin/users', data),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  updateSlotPrice: (id, data) => API.put(`/admin/slots/${id}/price`, data),
  getRevenue: (params) => API.get('/admin/revenue', { params }),
  getPricingPolicy: () => API.get('/admin/pricing-policy'),
  updatePricingPolicy: (data) => API.put('/admin/pricing-policy', data)
};

export default API;
