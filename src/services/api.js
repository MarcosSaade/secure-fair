import axios from 'axios';

// Dynamically use the hostname so it works from mobile devices on the same network
const API_BASE_URL = process.env.REACT_APP_API_URL || `/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Basic interceptor, later hook up with tokenStorage
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
