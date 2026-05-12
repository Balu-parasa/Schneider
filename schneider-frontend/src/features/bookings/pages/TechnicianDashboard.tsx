import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTechnicianBookings, acceptBooking, updateBookingStatus } from '../api/bookings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, User, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, slideUp } from '@/lib/animations';
import { toast } from 'sonner';

export const TechnicianDashboard = () => {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['technician-bookings'],
    queryFn: getTechnicianBookings,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-bookings'] });
      toast.success('Booking accepted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept booking');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-bookings'] });
      toast.success('Status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Technician Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned jobs and track status.</p>
        </div>

        {bookings?.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No bookings assigned to you right now.
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-2"
          >
            {bookings?.map((booking: any) => (
              <motion.div key={booking.id} variants={slideUp}>
                <Card className="glass h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{booking.service?.name}</CardTitle>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <CardDescription>{booking.booking_number}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="rounded-lg bg-slate-100 dark:bg-slate-900 p-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{booking.customer?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.address}, {booking.city}</span>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="text-sm border-l-2 border-primary pl-4 py-1 italic text-muted-foreground">
                        "{booking.notes}"
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-t border-border">
                    {booking.status === 'pending' && (
                      <Button 
                        className="w-full" 
                        onClick={() => acceptMutation.mutate(booking.id)}
                        disabled={acceptMutation.isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept Job
                      </Button>
                    )}
                    {booking.status === 'accepted' && (
                      <Button 
                        className="w-full" 
                        onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'in_progress' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Start Job (In Progress)
                      </Button>
                    )}
                    {booking.status === 'in_progress' && (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'completed' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
