
import { Shield, Users, CheckCircle, XCircle, AlertTriangle, Mail, Flag, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const CommunityStandards = () => {
  const standards = [
    {
      icon: Users,
      title: "Respect & Professionalism",
      description: "We expect all interactions to reflect professionalism.",
      dos: [
        "Be courteous in chats, sessions, and feedback",
        "Respect differences in learning pace and communication styles"
      ],
      donts: [
        "No abusive, offensive, or discriminatory language allowed"
      ],
      color: "blue"
    },
    {
      icon: Shield,
      title: "Integrity in Training",
      description: "Our platform is built on trust and skill.",
      dos: [
        "Only share genuine certifications and credentials",
        "Deliver the training as described in your profile and booking agenda",
        "Be on time and well-prepared for every session"
      ],
      donts: [
        "Plagiarism, misinformation, or delivering substandard content will lead to suspension"
      ],
      color: "green"
    },
    {
      icon: CheckCircle,
      title: "Transparency & Honesty",
      description: "Honesty builds long-term partnerships.",
      dos: [
        "Clients must clearly state training goals, timelines, and expectations",
        "Trainers must disclose any potential schedule conflicts early",
        "Communicate any changes immediately via platform chat"
      ],
      donts: [],
      color: "purple"
    }
  ];

  const policies = [
    {
      icon: XCircle,
      title: "No Off-Platform Transactions",
      description: "To ensure trust, accountability, and proper support, all transactions must stay on Skilloop.io.",
      content: [
        "Do not solicit payments or deals outside the platform",
        "Doing so violates our terms and may lead to account termination"
      ],
      type: "warning"
    },
    {
      icon: Heart,
      title: "Constructive Feedback Culture",
      description: "Feedback is a powerful tool for growth.",
      content: [
        "Share honest, specific feedback after each session",
        "Use feedback to improve, not criticize",
        "Trainers are encouraged to accept feedback gracefully and grow from it"
      ],
      type: "positive"
    },
    {
      icon: AlertTriangle,
      title: "Zero Tolerance for Misconduct",
      description: "We take safety and dignity seriously.",
      content: [
        "No harassment, threats, or inappropriate behavior",
        "No sharing of personal information beyond what is required for the session",
        "Violation may result in immediate suspension or legal action"
      ],
      type: "danger"
    },
    {
      icon: CheckCircle,
      title: "Commitment to Quality",
      description: "We're building India's most trusted trainer marketplace.",
      content: [
        "Keep your profile and calendar updated",
        "Submit session reports promptly",
        "Maintain high ratings and responsiveness"
      ],
      type: "success"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Home" />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-techblue-600 to-purple-600 bg-clip-text text-transparent">
                Community Standards
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Building trust, safety, and professionalism together
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              At <strong>Skilloop.io</strong>, we are building more than just a marketplace — we are nurturing a trusted community of <strong>trainers, learners, and organizations</strong> committed to meaningful, respectful, and impactful learning experiences.
            </p>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
              These standards apply to all users on the platform
            </Badge>
          </div>
        </div>

        {/* Core Standards */}
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Core Standards</h2>
          
          {standards.map((standard, index) => {
            const Icon = standard.icon;
            return (
              <Card key={index} className="border-l-4 border-l-techblue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${standard.color}-100`}>
                      <Icon className={`h-6 w-6 text-${standard.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{standard.title}</h3>
                      <p className="text-gray-600 font-normal">{standard.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {standard.dos.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-800 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Do's
                        </h4>
                        <ul className="space-y-2">
                          {standard.dos.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {standard.donts.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-red-800 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Don'ts
                        </h4>
                        <ul className="space-y-2">
                          {standard.donts.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Policies */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Additional Policies</h2>
          
          <div className="grid gap-6">
            {policies.map((policy, index) => {
              const Icon = policy.icon;
              const colorMap = {
                warning: 'orange',
                positive: 'blue',
                danger: 'red',
                success: 'green'
              };
              const color = colorMap[policy.type as keyof typeof colorMap];
              
              return (
                <Card key={index} className={`border-l-4 border-l-${color}-500`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${color}-100`}>
                        <Icon className={`h-6 w-6 text-${color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{policy.title}</h3>
                        <p className="text-gray-600 font-normal text-sm">{policy.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {policy.content.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <div className={`w-2 h-2 rounded-full bg-${color}-500 mt-2 flex-shrink-0`}></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Reporting Section */}
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-red-600" />
              Reporting Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you experience or witness behavior that violates these standards:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Flag className="h-4 w-4 text-red-600" />
                <span>Report directly via the "⚠️ Report" button on the session or profile</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-red-600" />
                <span>Email us at: <a href="mailto:safety@skilloop.io" className="text-red-600 underline">safety@skilloop.io</a></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-red-600" />
                <span>We investigate all reports promptly and fairly</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promise Section */}
        <Card className="bg-gradient-to-r from-techblue-500 to-purple-600 text-white text-center">
          <CardContent className="py-8">
            <Heart className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Our Promise</h3>
            <p className="text-blue-100 mb-4 max-w-2xl mx-auto">
              We're committed to creating a platform that's fair, inclusive, and enriching for all. 
              Let's build a respectful learning ecosystem — together.
            </p>
            <Separator className="my-4 bg-white/20" />
            <p className="text-sm text-blue-200">
              🔹 <em>Skilloop.io Team</em>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default CommunityStandards;
