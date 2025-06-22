
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const quickLinks = [
    { label: "Find Trainers", path: "/trainers", icon: Users },
    { label: "Browse Technologies", path: "/", icon: BookOpen },
    { label: "Search", path: "/search", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* 404 Animation */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200 animate-pulse">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🔍</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for seems to have vanished into the digital void. 
            But don't worry, we're here to help you get back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-techblue-600 hover:bg-techblue-700 text-white px-8 py-3"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/trainers')}
            className="px-8 py-3"
          >
            <Users className="h-4 w-4 mr-2" />
            Find Trainers
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <Icon className="h-5 w-5 text-techblue-600" />
                    <span className="text-gray-700">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>Still can't find what you're looking for?</p>
          <p>
            Contact our support team at{" "}
            <a href="mailto:support@skilloop.io" className="text-techblue-600 hover:underline">
              support@skilloop.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
