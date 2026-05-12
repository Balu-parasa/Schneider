import { CheckCircle2, Circle, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineProps {
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

export const BookingTimeline = ({ status }: TimelineProps) => {
  const steps = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { key: 'in_progress', label: 'In Progress', icon: Circle },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === status);
  };

  const currentIndex = getCurrentStepIndex();

  if (status === 'cancelled') {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
        <p className="font-semibold text-center">This booking was cancelled.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative flex justify-between">
        {/* Background line */}
        <div className="absolute left-0 top-5 w-full h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" />
        
        {/* Active line */}
        <motion.div 
          className="absolute left-0 top-5 h-[2px] bg-primary -z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-950 transition-colors ${
                  isCompleted 
                    ? 'border-primary text-primary' 
                    : 'border-slate-200 dark:border-slate-800 text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <span className={`text-xs font-medium ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
