import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true, // Crucial for refreshToken cookies
});

// Request interceptor to add accessToken to Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized - missing token), just logout
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    // If error is 403 (Invalid token or expired) and it's not the refresh attempt itself
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post('http://localhost:5001/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken } = data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redir to login if refresh fails
        localStorage.removeItem('accessToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
