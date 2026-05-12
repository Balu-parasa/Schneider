import { useQuery } from '@tanstack/react-query';
import { getServices } from '../api/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, slideUp } from '@/lib/animations';
import { Wrench, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ServiceListPage = () => {
  const navigate = useNavigate();
  const { data: servicesData, isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const services = Array.isArray(servicesData) ? servicesData : [];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
        <div className="shimmer h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="mt-4 text-muted-foreground animate-pulse">Loading premium services...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 text-destructive mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-destructive">Failed to load services</h2>
        <p className="text-muted-foreground mt-2">Please try refreshing the page later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 md:p-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="blob blob-purple h-96 w-96 top-[-10%] left-[-10%]" />
      <div className="blob blob-blue h-80 w-80 bottom-0 right-0" />

      <div className="mx-auto max-w-7xl relative z-10 fade-in">
        <div className="mb-12 text-center space-y-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Expert Industrial Services
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-text pb-2">
            What do you need help with?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a service below to instantly connect with a certified Schneider technician in your area.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-lg">No services available at the moment.</div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {services.map((service: any) => (
                <motion.div key={service.id} variants={slideUp} layout className="group h-full">
                  <Card className="glass-panel h-full flex flex-col hover-card overflow-hidden relative">
                    {/* Glowing background effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <CardHeader className="relative z-10">
                      <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-cyan-500 text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Wrench className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-2xl font-bold">{service.name}</CardTitle>
                      <CardDescription className="text-base mt-2 line-clamp-2">{service.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow relative z-10">
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-3xl font-extrabold text-foreground">${service.base_price}</span>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">/ {service.pricing_type}</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="relative z-10 pt-4 pb-6">
                      <Button
                        className="w-full btn-glow h-12 text-lg font-semibold group/btn"
                        onClick={() => navigate('/dashboard/book', { state: { serviceId: service.id } })}
                      >
                        Book Now
                        <ArrowRight className="ml-2 h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
