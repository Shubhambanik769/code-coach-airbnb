
import { Check, Users, Shield, TrendingUp, Clock, CreditCard, Star, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlatformBenefits = () => {
  const platformBenefits = [
    {
      icon: Users,
      title: "Instant Client Access",
      description: "Connect with universities, corporates, and training companies actively seeking trainers"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Guaranteed payments with automatic invoice generation and GST handling"
    },
    {
      icon: TrendingUp,
      title: "Professional Growth",
      description: "Build your reputation with verified reviews and ratings from real clients"
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Integrated calendar system with automated booking confirmations"
    },
    {
      icon: CreditCard,
      title: "Transparent Pricing",
      description: "Set your rates with clear commission structure - no hidden fees"
    },
    {
      icon: MessageCircle,
      title: "In-App Communication",
      description: "Professional chat system to discuss requirements with clients"
    }
  ];

  const comparisonData = [
    {
      feature: "Client Discovery",
      direct: "Cold outreach, networking events",
      platform: "Instant access to verified clients"
    },
    {
      feature: "Payment Security",
      direct: "Invoice chasing, payment delays",
      platform: "Guaranteed payments, auto-invoicing"
    },
    {
      feature: "Trust Building",
      direct: "Personal references only",
      platform: "Verified reviews & ratings system"
    },
    {
      feature: "Administrative Work",
      direct: "Manual scheduling, contracts",
      platform: "Automated booking & documentation"
    },
    {
      feature: "Market Reach",
      direct: "Limited to personal network",
      platform: "Access to entire platform ecosystem"
    },
    {
      feature: "Professional Support",
      direct: "Handle disputes yourself",
      platform: "Platform mediation & support"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Platform Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            Why Join TrainerConnect?
          </CardTitle>
          <p className="text-gray-600 text-center">
            Transform your training career with our comprehensive platform
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-techblue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            Platform vs Direct Client Connection
          </CardTitle>
          <p className="text-gray-600 text-center">
            See how TrainerConnect streamlines your training business
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-left py-3 px-4 font-semibold text-red-600">Direct Connection</th>
                  <th className="text-left py-3 px-4 font-semibold text-green-600">TrainerConnect Platform</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.feature}</td>
                    <td className="py-3 px-4 text-red-700 text-sm">{item.direct}</td>
                    <td className="py-3 px-4 text-green-700 text-sm flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      {item.platform}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Success Stats */}
      <Card className="bg-gradient-to-r from-techblue-50 to-purple-50">
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-techblue-600">1000+</div>
              <div className="text-sm text-gray-600">Active Trainers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-techblue-600">500+</div>
              <div className="text-sm text-gray-600">Partner Organizations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-techblue-600">₹50L+</div>
              <div className="text-sm text-gray-600">Trainer Earnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-techblue-600">4.8⭐</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformBenefits;
