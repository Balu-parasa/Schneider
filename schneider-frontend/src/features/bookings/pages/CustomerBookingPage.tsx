import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '../api/bookings';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';

export const CustomerBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const serviceId = location.state?.serviceId;

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      toast.success('Booking created successfully');
      navigate('/dashboard/bookings');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      toast.error('No service selected');
      navigate('/dashboard/services');
      return;
    }
    bookingMutation.mutate({ service_id: serviceId, address, city, notes });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="mx-auto max-w-2xl">
        <motion.div variants={scaleIn} initial="hidden" animate="visible">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Complete Your Booking</CardTitle>
              <CardDescription>Provide details for the technician to reach you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Issue Description / Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe the issue you are facing..."
                    className="h-32"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={bookingMutation.isPending}>
                    {bookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
