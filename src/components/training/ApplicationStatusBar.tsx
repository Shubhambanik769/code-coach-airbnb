
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, XCircle, Calendar, Star } from 'lucide-react';

interface ApplicationStatusBarProps {
  status: string;
  createdAt: string;
  bookingId?: string;
}

const ApplicationStatusBar = ({ status, createdAt, bookingId }: ApplicationStatusBarProps) => {
  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Applied', icon: Clock },
      { key: 'shortlisted', label: 'Shortlisted', icon: Star },
      { key: 'selected', label: 'Selected', icon: CheckCircle },
      { key: 'booking_confirmed', label: 'Booking Confirmed', icon: Calendar },
    ];

    const currentIndex = steps.findIndex(step => step.key === status);
    const isRejected = status === 'rejected';
    
    return { steps, currentIndex, isRejected };
  };

  const { steps, currentIndex, isRejected } = getStatusSteps();
  const progressPercentage = isRejected ? 25 : ((currentIndex + 1) / steps.length) * 100;

  if (isRejected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="h-5 w-5 text-red-600" />
          <span className="font-medium text-red-800">Application Rejected</span>
        </div>
        <p className="text-sm text-red-600">
          Your application was not selected for this training request.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">Application Status</h4>
        <Badge variant="outline" className="bg-white">
          {steps[currentIndex]?.label || 'Applied'}
        </Badge>
      </div>
      
      <div className="mb-4">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div
              key={step.key}
              className={`flex flex-col items-center gap-1 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
      
      {bookingId && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
          <span className="text-sm text-green-700 font-medium">
            🎉 Booking Confirmed! Check your bookings tab.
          </span>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusBar;
