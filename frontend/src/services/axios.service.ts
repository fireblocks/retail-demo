import axios, { AxiosError } from 'axios';

const axiosInstance = axios.create({
  withCredentials: true
});

axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

// Add an interceptor for response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('Axios error:', error);

    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', error.response.data);

      if (error.response.status === 401) {
        console.log('Unauthorized access detected. Redirecting to login...');
        window.location.href = '/login'; 
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
