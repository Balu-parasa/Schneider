import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEcho } from '@/hooks/useEcho';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Navigation } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { BookingTimeline } from '../components/BookingTimeline';
import { motion } from 'framer-motion';

export const LiveTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { echo } = useEcho();
  const { theme } = useTheme();

  const [technicianLocation, setTechnicianLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/customer/bookings/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;

    // Listen for real-time location updates on the booking's private channel
    const channel = echo.private(`bookings.${id}`);
    
    channel.listen('.technician.location_updated', (e: any) => {
      setTechnicianLocation({
        lat: parseFloat(e.latitude),
        lng: parseFloat(e.longitude),
      });
    });

    return () => {
      channel.stopListening('.technician.location_updated');
      echo.leave(`bookings.${id}`);
    };
  }, [id, echo]);

  const mapStyle = theme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/light-v11';

  // Smooth interpolation transition is handled natively by Mapbox GL Marker if updated fast enough,
  // but react-map-gl automatically handles react prop updates smoothly if `longitude`/`latitude` change.
  
  const initialViewState = useMemo(() => {
    // If we have a location, center on it. Otherwise, defaults to a wide view.
    return {
      longitude: technicianLocation?.lng || -122.4,
      latitude: technicianLocation?.lat || 37.8,
      zoom: 14,
    };
  }, []); // Only run once to avoid jumping if user pans

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Sidebar Panel */}
      <div className="w-full md:w-96 flex-shrink-0 border-r border-border bg-white dark:bg-slate-950 p-6 overflow-y-auto z-10 flex flex-col gap-6 shadow-xl">
        <Button variant="ghost" className="w-fit pl-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Tracking</h2>
          <p className="text-muted-foreground">{booking?.booking_number}</p>
        </div>

        <Card className="glass shadow-none border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Booking Status</CardTitle>
            <CardDescription>{booking?.service?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingTimeline status={booking?.status || 'pending'} />
          </CardContent>
        </Card>

        {booking?.technician && (
          <Card className="glass shadow-none border-border">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {booking.technician.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold leading-none">{booking.technician.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Assigned Technician</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-auto">
           {technicianLocation ? (
              <div className="rounded-lg bg-primary/10 p-4 flex items-start gap-3 text-primary">
                <Navigation className="h-5 w-5 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-medium text-sm">Tracking Active</p>
                  <p className="text-xs opacity-80 mt-1">Receiving live GPS updates from technician.</p>
                </div>
              </div>
           ) : booking?.status === 'in_progress' ? (
              <div className="rounded-lg bg-yellow-500/10 p-4 text-yellow-600 dark:text-yellow-500">
                <p className="font-medium text-sm">Waiting for GPS signal...</p>
              </div>
           ) : (
              <div className="rounded-lg bg-slate-100 dark:bg-slate-900 p-4 text-muted-foreground">
                <p className="font-medium text-sm">Tracking Offline</p>
                <p className="text-xs mt-1">Live tracking begins when the technician starts the job.</p>
              </div>
           )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <Map
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle={mapStyle}
          reuseMaps
        >
          <NavigationControl position="top-right" />
          
          {technicianLocation && (
            <Marker 
              longitude={technicianLocation.lng} 
              latitude={technicianLocation.lat} 
              anchor="bottom"
            >
              <motion.div 
                className="relative flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Ping animation effect */}
                <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-primary opacity-40"></span>
                <div className="relative h-6 w-6 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center">
                  <Navigation className="h-3 w-3 text-white fill-white" />
                </div>
              </motion.div>
            </Marker>
          )}
        </Map>
      </div>
    </div>
  );
};
