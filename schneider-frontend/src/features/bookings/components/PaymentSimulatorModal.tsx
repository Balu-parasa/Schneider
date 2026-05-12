import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { toast } from 'sonner';

interface PaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
}

export const PaymentSimulatorModal = ({ isOpen, onClose, bookingId, amount }: PaymentSimulatorModalProps) => {
  const [step, setStep] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const queryClient = useQueryClient();

  const processPayment = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/v1/customer/bookings/${bookingId}/payment/simulate`, {
        card_number: '4242424242424242',
      });
      return response.data;
    },
    onMutate: () => {
      setStep('processing');
    },
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      setTimeout(() => {
        onClose();
        setStep('idle');
        toast.success('Payment successful! Invoice generated.');
      }, 2500);
    },
    onError: (error: any) => {
      setStep('failed');
      toast.error(error.response?.data?.message || 'Payment simulation failed.');
    },
  });

  const handlePay = () => {
    processPayment.mutate();
  };

  const resetAndClose = () => {
    setStep('idle');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && step !== 'processing' && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Secure Checkout</DialogTitle>
          <DialogDescription>
            <span className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded mt-2 text-xs font-medium w-fit">
              <ShieldCheck className="h-3 w-3" />
              Demo Simulation Mode
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 min-h-[200px]">
          <AnimatePresence mode="wait">
            {step === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center w-full"
              >
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-1">${amount.toFixed(2)}</h3>
                <p className="text-sm text-muted-foreground mb-6">Total amount to pay</p>
                <Button className="w-full" size="lg" onClick={handlePay}>
                  Simulate Payment
                </Button>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold">Processing Payment...</h3>
                <p className="text-sm text-muted-foreground">Connecting to secure gateway</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-green-600 dark:text-green-500"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle className="h-20 w-20 mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold">Payment Successful</h3>
                <p className="text-sm opacity-80 mt-1">Generating your receipt...</p>
              </motion.div>
            )}

            {step === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center text-destructive"
              >
                <XCircle className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold">Payment Failed</h3>
                <p className="text-sm opacity-80 text-center mt-1 mb-4">The simulation randomly declined this transaction.</p>
                <Button variant="outline" onClick={() => setStep('idle')}>Try Again</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
