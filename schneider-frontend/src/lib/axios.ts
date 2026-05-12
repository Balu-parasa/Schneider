import Axios from 'axios';

const axios = Axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 419) {
      // Logic for handling unauthorized, e.g. clear zustand store or redirect to login.
      // Handled via the Auth Provider/Zustand generally.
    }
    return Promise.reject(error);
  }
);

export default axios;
