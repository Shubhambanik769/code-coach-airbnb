
import { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Shield, 
  Download,
  Star,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trophy,
  FileText,
  Video,
  Gift
} from 'lucide-react';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TrainerResources = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'profile-setup', label: 'Profile Setup', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'pricing', label: 'Pricing & Earnings', icon: DollarSign },
    { id: 'delivery', label: 'Training Delivery', icon: Video },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'resources', label: 'Bonus Resources', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton to="/" label="Back to Home" />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-techblue-600 to-purple-600 bg-clip-text text-transparent">
                Trainer Resource Hub
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Everything you need to grow, earn, and succeed as a verified trainer
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              500+ Active Trainers
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              4.8/5 Average Rating
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <DollarSign className="h-4 w-4 mr-2" />
              ₹50K+ Monthly Earnings
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex flex-col items-center gap-1 p-2 text-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:block">{section.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Who Can Become a Trainer?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Experience</h4>
                      <p className="text-sm text-blue-700">2+ years of domain expertise</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-900">Certified</h4>
                      <p className="text-sm text-green-700">Relevant technology certifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-purple-900">Passionate</h4>
                      <p className="text-sm text-purple-700">Love for teaching & impact</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Steps to Get Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    'Fill the trainer onboarding form',
                    'Upload valid government ID + certifications',
                    'Wait for admin review (48–72 hrs)',
                    'If approved, start receiving bookings',
                    'If rejected, reapply after 6 months or join our trainer program'
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-techblue-100 text-techblue-700 rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Setup */}
          <TabsContent value="profile-setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Setting Up Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">💡 Pro Tip:</p>
                  <p className="text-blue-700 text-sm">Trainers with detailed profiles and good photos get 3× more bookings.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Bio Tips</h4>
                        <p className="text-sm text-gray-600">Keep it clear, relevant, and human</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Profile Photo</h4>
                        <p className="text-sm text-gray-600">Use a clear, professional headshot</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-gray-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Certifications</h4>
                        <p className="text-sm text-gray-600">Upload PDFs (minimum 1 mandatory)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-gray-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Technologies & Skills</h4>
                        <p className="text-sm text-gray-600">Tag your expertise for discoverability</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Management */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-green-600" />
                  Managing Your Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Calendar Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Block unavailable dates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Add flexible time slots</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Real-time client visibility</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Prevent double bookings</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">⏰ Time Slot Options</h4>
                    <div className="space-y-2 text-sm">
                      <Badge variant="outline">1 Hour</Badge>
                      <Badge variant="outline">2 Hours</Badge>
                      <Badge variant="outline">Half Day</Badge>
                      <Badge variant="outline">Full Day</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing & Earnings */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Pricing & Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Setting Your Rates</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Go to Dashboard → Pricing Settings</li>
                      <li>• Set your base rate (per session/day/module)</li>
                      <li>• Platform commission + GST auto-calculated</li>
                      <li>• Payout processed within 3–5 working days</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">💰 Earnings Transparency</h4>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Booking-wise breakdown in Earnings tab</li>
                      <li>• GST-compliant invoice downloads</li>
                      <li>• Bank details in Payout Settings</li>
                      <li>• Clear commission structure</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Delivery */}
          <TabsContent value="delivery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-6 w-6 text-purple-600" />
                  Delivering Great Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">✅ Before Session</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• Connect via in-app chat</li>
                      <li>• Confirm the agenda</li>
                      <li>• Prepare devices & slides</li>
                      <li>• Be on time!</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">📈 During Session</h4>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Be engaging & interactive</li>
                      <li>• Use practical examples</li>
                      <li>• Stick to timing</li>
                      <li>• Stay professional</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">📝 After Session</h4>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li>• Upload session report</li>
                      <li>• Submit attendance</li>
                      <li>• Mark as "Delivered"</li>
                      <li>• Request feedback</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  Communication & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Best Practices</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Use in-app chat for all communication</li>
                      <li>• Maintain professional tone</li>
                      <li>• Respond promptly to queries</li>
                      <li>• Clarify goals before sessions</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">⭐ Rating System</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Ratings appear on your profile and influence future bookings
                    </p>
                    <Badge className="bg-yellow-200 text-yellow-800">
                      4.5★+ = Top Trainer Badge Eligible
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies */}
          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  Policies & Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-orange-800">Late Cancellations</h4>
                        <p className="text-sm text-orange-700">
                          Avoid last-minute cancellations. Inform support + client ASAP if unavoidable.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Replacements</h4>
                        <p className="text-sm text-blue-700">
                          If unavailable, mark calendar or request support for replacement trainer.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-red-800">Violations</h4>
                        <ul className="text-sm text-red-700 mt-2 space-y-1">
                          <li>• Fake certifications may result in account ban</li>
                          <li>• No-shows or misconduct = immediate review</li>
                          <li>• Repeat cancellations = low rating + reduced visibility</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonus Resources */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-6 w-6 text-purple-600" />
                  Bonus Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold mb-3">📥 Downloadable Resources</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Session Report Template (PDF)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Engaging Training Guide
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tips to Get More Bookings
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold mb-3">🎓 Learning Opportunities</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                        <h5 className="font-medium text-purple-800">Free Trainer Skill Booster</h5>
                        <p className="text-sm text-purple-600">Coming Soon</p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                        <h5 className="font-medium text-green-800">Virtual Trainer Meetups</h5>
                        <p className="text-sm text-green-600">Monthly networking events</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-techblue-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-2">Ready to become a high-impact trainer?</h3>
                <p className="text-blue-100 mb-4">
                  Keep your calendar live, stay responsive, and let your skills do the talking.
                </p>
                <Button variant="secondary" size="lg">
                  Apply to Become a Trainer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainerResources;
