import axios from '@/lib/axios';

export const createBooking = async (data: any) => {
  const response = await axios.post('/api/v1/customer/bookings', data);
  return response.data.data;
};

export const getCustomerBookings = async () => {
  const response = await axios.get('/api/v1/customer/bookings');
  return response.data.data;
};

export const getTechnicianBookings = async () => {
  const response = await axios.get('/api/v1/technician/bookings');
  return response.data.data;
};

export const acceptBooking = async (bookingId: string) => {
  const response = await axios.post(`/api/v1/technician/bookings/${bookingId}/accept`);
  return response.data.data;
};

export const updateBookingStatus = async ({ bookingId, status, notes }: { bookingId: string; status: string; notes?: string }) => {
  const response = await axios.patch(`/api/v1/technician/bookings/${bookingId}/status`, { status, notes });
  return response.data.data;
};
