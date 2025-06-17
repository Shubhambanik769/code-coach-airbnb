
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'trainer':
        return '/trainer-dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleBecomeTrainer = () => {
    if (userRole === 'trainer') {
      navigate('/trainer');
    } else if (user) {
      navigate('/trainer-status');
    } else {
      navigate('/apply-trainer');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SL</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Skilloop.io
              </span>
              <span className="text-xs text-gray-400 -mt-1">by Gyanyodha</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-700 rounded-full"></div>
            ) : !user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={handleBecomeTrainer}
                  className="hidden sm:inline-flex text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Become a Trainer
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {userRole !== 'trainer' && (
                  <Button 
                    variant="ghost" 
                    onClick={handleBecomeTrainer}
                    className="hidden sm:inline-flex text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    Become a Trainer
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(getDashboardRoute())}
                  className="hidden sm:inline-flex text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Sign Out
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-3">
              {user && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(getDashboardRoute())}
                    className="text-left justify-start py-2 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    Dashboard
                  </Button>
                  {userRole !== 'trainer' && (
                    <Button 
                      variant="ghost" 
                      onClick={handleBecomeTrainer}
                      className="text-left justify-start py-2 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      Become a Trainer
                    </Button>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
