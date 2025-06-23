
import { Shield, CheckCircle, DollarSign, Calendar, RefreshCw, Star, Scale, Heart, Mail, MessageCircle, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const TrainerProtection = () => {
  const protectionFeatures = [
    {
      icon: Shield,
      title: "Verified Clients Only",
      description: "We onboard only legitimate, verified clients — including corporates, universities, institutes, and training companies. All clients go through ID/email/domain checks before booking.",
      benefits: [
        "No random or unverified session requests",
        "Only real opportunities, no spam leads"
      ],
      color: "blue"
    },
    {
      icon: DollarSign,
      title: "Guaranteed Payments",
      description: "We ensure trainers are paid on time and in full, once a session is successfully delivered.",
      benefits: [
        "Payments are held securely in escrow",
        "Automatic payout within 3–5 business days after feedback or delivery confirmation",
        "Transparent breakdown: session fee, GST, platform commission shown clearly"
      ],
      highlight: "No follow-ups or chasing clients for payment",
      color: "green"
    },
    {
      icon: FileText,
      title: "Clear Booking & Agenda Info",
      description: "Every booking includes clear session objectives, expected duration, and client details so you know exactly what's required before accepting.",
      benefits: [
        "View training description, goals, and materials in advance",
        "Discuss agenda via in-app chat before delivery"
      ],
      highlight: "Stay prepared, aligned, and in control",
      color: "purple"
    },
    {
      icon: Calendar,
      title: "Cancellation Protection",
      description: "If a client cancels last minute, you're protected.",
      benefits: [
        "Short-notice cancellation (<24 hrs) = partial compensation",
        "Repeat cancellations by client are monitored and penalized"
      ],
      highlight: "Your time is respected",
      color: "orange"
    },
    {
      icon: RefreshCw,
      title: "Replacement Safety",
      description: "If you're unable to deliver due to emergencies:",
      benefits: [
        "Mark yourself unavailable in your calendar",
        "We help the client rebook without affecting your profile",
        "No negative rating applied if you're replaced for valid reasons"
      ],
      highlight: "Flexible, fair, and human-friendly",
      color: "teal"
    },
    {
      icon: Star,
      title: "Ratings Protection",
      description: "We ensure ratings are fair and balanced.",
      benefits: [
        "You'll always have a chance to respond to feedback",
        "Irrelevant, rude, or fake reviews can be reported and removed",
        "High-rated trainers get visibility boosts and badges"
      ],
      highlight: "Your reputation is protected and promoted",
      color: "yellow"
    },
    {
      icon: Scale,
      title: "Dispute Resolution Support",
      description: "In case of disagreement with a client:",
      benefits: [
        "Contact us via support@skilloop.io or live chat",
        "We mediate based on booking data, chat logs, and feedback",
        "If the client is at fault, we still release your payment"
      ],
      highlight: "Transparent, neutral resolution — always",
      color: "red"
    }
  ];

  const commitments = [
    "Never let clients contact you directly outside the platform",
    "Handle legal terms, billing, and compliance for you",
    "Promote your skills to high-quality clients only",
    "Offer long-term loyalty and growth programs"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Home" />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-techblue-600 to-purple-600 bg-clip-text text-transparent">
                Trainer Protection
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Empowering you to teach confidently
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              As a trainer on <strong>Skilloop.io</strong>, your <strong>time, skills, and integrity</strong> are respected and protected. 
              This page outlines how we ensure a <strong>safe, fair, and professional environment</strong> for every certified trainer on our platform.
            </p>
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
              While we take care of your safety, payment, and peace of mind
            </Badge>
          </div>
        </div>

        {/* Protection Features */}
        <div className="grid gap-8 mb-12">
          {protectionFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-l-4 border-l-techblue-500 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${feature.color}-100 flex-shrink-0`}>
                      <Icon className={`h-6 w-6 text-${feature.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-800">
                          {index + 1}.
                        </span>
                        <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600 font-normal">{feature.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="ml-16">
                    <ul className="space-y-2 mb-4">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    {feature.highlight && (
                      <div className={`bg-${feature.color}-50 border border-${feature.color}-200 rounded-lg p-3`}>
                        <p className={`text-${feature.color}-800 font-medium text-sm`}>
                          🎯 {feature.highlight}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Our Commitment */}
        <Card className="bg-gradient-to-r from-techblue-50 to-purple-50 border-techblue-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-techblue-600" />
              Our Commitment to Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              At Skilloop.io, we believe <strong>trainers are the heart of learning</strong>. That's why we:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {commitments.map((commitment, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {commitment}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-green-600" />
              Need Help or Have Concerns?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Mail className="h-8 w-8 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Email Support</h4>
                <a href="mailto:trainers@skilloop.io" className="text-blue-600 hover:underline text-sm">
                  trainers@skilloop.io
                </a>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <h4 className="font-semibold text-gray-800">Live Chat</h4>
                <p className="text-gray-600 text-sm">Via your dashboard</p>
                <p className="text-xs text-gray-500">Mon–Fri, 10 AM – 6 PM IST</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <FileText className="h-8 w-8 text-purple-600" />
                <h4 className="font-semibold text-gray-800">Help Center</h4>
                <Button variant="outline" size="sm" className="text-xs">
                  Visit Help Center
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Message */}
        <div className="text-center mt-8">
          <p className="text-lg font-semibold text-gray-700">
            <strong>Skilloop.io</strong> — Built to protect the people who power learning.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrainerProtection;
