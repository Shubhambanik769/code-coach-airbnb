
import { useState, useEffect } from 'react';
import { Search, Menu, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(profile?.role);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">TT</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gradient">TechTrainer</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors text-sm xl:text-base">Find Trainers</a>
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors text-sm xl:text-base">Become a Trainer</a>
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors text-sm xl:text-base">For Companies</a>
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors text-sm xl:text-base">Help</a>
            {userRole === 'admin' && (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin')}
                className="text-sm xl:text-base"
              >
                Admin
              </Button>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1 text-xs sm:text-sm">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>EN</span>
            </Button>
            
            {!user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex text-xs sm:text-sm">
                  Become a trainer
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                  className="text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 hidden md:inline">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-1 p-1 border border-gray-200 rounded-full hover:shadow-md transition-shadow cursor-pointer">
              <Menu className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium py-2 text-base">Find Trainers</a>
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium py-2 text-base">Become a Trainer</a>
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium py-2 text-base">For Companies</a>
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium py-2 text-base">Help</a>
              {userRole === 'admin' && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin')}
                  className="text-left justify-start py-2 text-base"
                >
                  Admin Dashboard
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
