import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
});

// Callback to notify UI layer on 401 unauthorized errors
let onUnauthorizedCallback: ((isExpired: boolean) => void) | null = null;

export const setOnUnauthorized = (callback: (isExpired: boolean) => void) => {
  onUnauthorizedCallback = callback;
};

// Request Interceptor: Attach token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      
      const isExpired = error.response.data?.data?.code === 'TOKEN_EXPIRED';
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback(isExpired);
      }
    }
    return Promise.reject(error);
  }
);
