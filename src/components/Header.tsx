

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { Menu, X, User, LogOut, Settings, BarChart3, FileText, Briefcase } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <header className="apple-blur border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <img 
              src="/lovable-uploads/47af27d3-23ea-4024-aa71-701579305a9b.png" 
              alt="Skilloop.io Logo" 
              className="w-12 h-12 rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gradient">
                Skilloop.io
              </span>
              <span className="text-xs text-muted-foreground -mt-1">by Gyanyodha</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link 
              to="/trainers" 
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Find Trainers
            </Link>
            <Link 
              to="/training-marketplace" 
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Training Marketplace
            </Link>
            <Link 
              to="/about" 
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              to="/careers" 
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Careers
            </Link>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-2xl hover:bg-secondary/80">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-sm font-semibold">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 apple-blur border-border/50" align="end" forceMount>
                    <div className="flex items-center justify-start gap-3 p-4">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-semibold text-foreground">{user.email}</p>
                        {userRole && (
                          <Badge variant="secondary" className="w-fit text-xs rounded-full">
                            {userRole}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center py-3 px-4">
                        <BarChart3 className="mr-3 h-5 w-5" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/trainer-status" className="flex items-center py-3 px-4">
                        <User className="mr-3 h-5 w-5" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={handleSignOut} className="py-3 px-4">
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/apply-trainer">
                  <Button variant="ghost" className="btn-secondary">Become a Trainer</Button>
                </Link>
                <Link to="/auth">
                  <Button className="btn-primary">Sign In</Button>
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
          <div className="md:hidden apple-blur border-t border-border/50 py-6">
            <nav className="flex flex-col space-y-6">
              <Link 
                to="/trainers" 
                className="text-foreground/80 hover:text-foreground transition-colors px-6 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Trainers
              </Link>
              <Link 
                to="/training-marketplace" 
                className="text-foreground/80 hover:text-foreground transition-colors px-6 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Training Marketplace
              </Link>
              <Link 
                to="/about" 
                className="text-foreground/80 hover:text-foreground transition-colors px-6 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/careers" 
                className="text-foreground/80 hover:text-foreground transition-colors px-6 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Careers
              </Link>
              
              {user ? (
                <div className="flex flex-col space-y-4 px-6 pt-6 border-t border-border/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-sm font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{user.email}</span>
                      {userRole && (
                        <Badge variant="secondary" className="text-xs rounded-full w-fit">
                          {userRole}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link 
                    to={getDashboardLink()} 
                    className="text-foreground/80 hover:text-foreground transition-colors flex items-center py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/trainer-status" 
                    className="text-foreground/80 hover:text-foreground transition-colors flex items-center py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-foreground/80 hover:text-foreground transition-colors flex items-center text-left py-2"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 px-6 pt-6 border-t border-border/50">
                  <Link to="/apply-trainer" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-secondary">Become a Trainer</Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-primary">Sign In</Button>
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

