
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND,
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  googleLogin: (token: string) => api.post('/auth/google', { token }),
  adminLogin: (credentials: any) => api.post('/auth/adminlogin', credentials ),
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  uploadImage: (formData: FormData) =>
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getUsers: () => api.get('/users/getallusers'),
  updateProfile: (userData: any) => api.put('/users/me', userData),
};

export const packageService = {
  getAllPackages: (params?: any) => api.get('/packages', { params }),
  getPackageById: (id: string) => api.get(`/packages/${id}`),
  createPackage: (packageData: any) => api.post('/packages', packageData),
  updatePackage: (id: string, packageData: any) => api.put(`/packages/${id}`, packageData),
  deletePackage: (id: string) => api.delete(`/packages/${id}`),
};

export const bookingService = {
  getAllBookings: () => api.get('/bookings'),
  getUserBookings: () => api.get('/bookings/my'),
  getBookingById: (id: string) => api.get(`/bookings/${id}`),
  createBooking: (bookingData: any) => api.post('/bookings', bookingData),
  updateBooking: (id: string, bookingData: any) => api.put(`/bookings/${id}`, bookingData),
};

export default api;
