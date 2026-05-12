import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEcho } from './useEcho';
import { toast } from 'sonner';

export const useBookingSync = (bookingId: string) => {
  const { echo } = useEcho();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!bookingId) return;

    const channel = echo.private(`bookings.${bookingId}`);

    channel.listen('.booking.status_updated', (e: any) => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['technician-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      
      toast.info(`Booking status updated to ${e.new_status}`, {
        description: e.notes ? `Note: ${e.notes}` : undefined,
      });
    });

    channel.listen('.booking.accepted', () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['technician-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      
      toast.success('Your booking has been accepted!');
    });

    return () => {
      channel.stopListening('.booking.status_updated');
      channel.stopListening('.booking.accepted');
      echo.leave(`bookings.${bookingId}`);
    };
  }, [bookingId, echo, queryClient]);
};
