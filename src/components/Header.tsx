
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Menu, X, User, LogOut, Settings, BarChart3, FileText, Briefcase, Search, MapPin, Calendar, ShoppingCart } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'trainer':
        return '/trainer-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/47af27d3-23ea-4024-aa71-701579305a9b.png" 
              alt="Skilloop.io Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <div className="flex flex-col relative">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Skilloop.io
                </span>
                {/* Beautiful Beta Badge */}
                <div className="relative">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-lg animate-pulse">
                    BETA
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-sm opacity-30 animate-pulse"></div>
                </div>
              </div>
              <span className="text-xs text-gray-500 -mt-1">by Gyanyodha</span>
            </div>
          </Link>

          {/* Location and Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8 space-x-4">
            {/* Location Selector */}
            <div className="flex items-center min-w-0">
              <MapPin className="h-4 w-4 text-gray-500 mr-2" />
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-48 border-none shadow-none bg-transparent focus:ring-0">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {cities.map((city) => (
                    <SelectItem key={city} value={city} className="hover:bg-gray-50">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="relative flex items-center">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for training services"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600" />
            <ShoppingCart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600" />
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2 bg-white" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.email}</p>
                        {userRole && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            {userRole}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-px bg-gray-200 my-1" />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/trainer-status" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-gray-200 my-1" />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/apply-trainer">
                  <Button variant="outline">Become a Trainer</Button>
                </Link>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/trainers" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Trainers
              </Link>
              <Link 
                to="/training-marketplace" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Training Marketplace
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/careers" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Careers
              </Link>
              
              {user ? (
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.email}</span>
                    {userRole && (
                      <Badge variant="secondary" className="text-xs">
                        {userRole}
                      </Badge>
                    )}
                  </div>
                  <Link 
                    to={getDashboardLink()} 
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/trainer-status" 
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 transition-colors flex items-center text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                  <Link to="/apply-trainer" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Become a Trainer</Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

