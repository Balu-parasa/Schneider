import axios from '@/lib/axios';

export const getServices = async () => {
  const response = await axios.get('/api/v1/services');
  return response.data.data;
};
