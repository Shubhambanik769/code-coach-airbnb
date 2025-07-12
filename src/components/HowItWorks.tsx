
import { 
  Search, 
  MapPin, 
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    icon: MapPin,
    title: "Select Your Location",
    description: "Choose your city to find nearby trainers",
    color: "bg-blue-500"
  },
  {
    icon: Search,
    title: "Pick a Service",
    description: "Browse training categories and select what you need",
    color: "bg-green-500"
  },
  {
    icon: CreditCard,
    title: "Book & Pay",
    description: "Get instant confirmation and pay securely",
    color: "bg-purple-500"
  },
  {
    icon: CheckCircle,
    title: "Get Trained",
    description: "Expert trainer arrives at your office on time",
    color: "bg-orange-500"
  }
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600">
            Book professional training in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/services')}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium"
          >
            Book a Service
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
