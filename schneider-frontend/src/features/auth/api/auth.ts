import axios from '@/lib/axios';

export const csrf = () => axios.get('/sanctum/csrf-cookie');

export const login = async (data: any) => {
  await csrf();
  return axios.post('/api/v1/auth/login', data);
};

export const register = async (data: any) => {
  await csrf();
  return axios.post('/api/v1/auth/register', data);
};

export const logout = async () => {
  return axios.post('/api/v1/auth/logout');
};
