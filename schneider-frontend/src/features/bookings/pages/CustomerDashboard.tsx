import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomerBookings } from '../api/bookings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, MapPin, Receipt, CreditCard, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, slideUp } from '@/lib/animations';
import { PaymentSimulatorModal } from '../components/PaymentSimulatorModal';
import axios from '@/lib/axios';

export const CustomerDashboard = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: getCustomerBookings,
  });

  const bookings = Array.isArray(bookingsData) ? bookingsData : [];

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const response = await axios.get(`/api/v1/customer/bookings/${bookingId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to download invoice', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
        <div className="shimmer h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="mt-4 text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 md:p-12 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="blob blob-blue h-96 w-96 top-0 left-0" />
      <div className="blob blob-cyan h-80 w-80 bottom-0 right-0" />
      
      <div className="mx-auto max-w-6xl relative z-10 fade-in">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Your Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your service requests and track your technicians in real-time.</p>
        </div>

        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel flex flex-col items-center justify-center rounded-2xl p-16 text-center shadow-xl"
          >
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No active bookings yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Looks like you haven't booked any services yet. Browse our premium services and get started!
            </p>
            <Button className="btn-glow text-lg px-8 py-6 rounded-xl" onClick={() => window.location.href = '/dashboard/services'}>
              Explore Services
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"
          >
            <AnimatePresence>
              {bookings.map((booking: any) => (
                <motion.div key={booking.id} variants={slideUp} layout>
                  <Card className="glass h-full hover-card border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">{booking.service?.name || 'Service Request'}</CardTitle>
                        <span className="rounded-full bg-primary/15 px-4 py-1.5 text-xs font-bold tracking-wider text-primary uppercase shadow-sm">
                          {booking.status}
                        </span>
                      </div>
                      <CardDescription className="text-sm font-medium tracking-wide">REF: {booking.booking_number}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{booking.address}, {booking.city}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{new Date(booking.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>

                      {booking.technician && (
                        <div className="rounded-xl bg-background/40 backdrop-blur-sm p-4 border border-border/50 flex items-center justify-between group transition-colors hover:bg-background/60">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">
                              {booking.technician.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Technician</p>
                              <p className="text-base font-bold text-foreground">{booking.technician.name}</p>
                            </div>
                          </div>
                          {['accepted', 'in_progress'].includes(booking.status) && (
                            <Button 
                              variant="default" 
                              className="btn-glow rounded-full px-6"
                              onClick={() => window.location.href = `/dashboard/tracking/${booking.id}`}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              Track
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Payment & Invoice Section */}
                      <div className="pt-4 flex justify-between items-center border-t border-border/30">
                        <div className="text-lg font-bold">
                          Total: <span className="text-primary">${parseFloat(booking.total_price).toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'in_progress' && (
                            <Button 
                              className="btn-glow bg-cyan-600 hover:bg-cyan-700 text-white"
                              onClick={() => {
                                setSelectedBookingForPayment(booking);
                                setPaymentModalOpen(true);
                              }}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay Now
                            </Button>
                          )}
                          {booking.status === 'completed' && (
                            <Button variant="outline" className="border-primary/30 hover:bg-primary/10" onClick={() => handleDownloadInvoice(booking.id)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {selectedBookingForPayment && (
        <PaymentSimulatorModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedBookingForPayment(null);
          }}
          bookingId={selectedBookingForPayment.id}
          amount={parseFloat(selectedBookingForPayment.total_price) * 1.08}
        />
      )}
    </div>
  );
};
