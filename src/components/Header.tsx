
import { useState } from 'react';
import { Search, Menu, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TT</span>
              </div>
              <span className="text-xl font-bold text-gradient">TechTrainer</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors">Find Trainers</a>
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors">Become a Trainer</a>
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors">For Companies</a>
            <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium transition-colors">Help</a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Become a trainer
            </Button>

            <div className="flex items-center space-x-1 p-1 border border-gray-200 rounded-full hover:shadow-md transition-shadow cursor-pointer">
              <Menu className="w-4 h-4 ml-2" />
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium">Find Trainers</a>
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium">Become a Trainer</a>
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium">For Companies</a>
              <a href="#" className="text-gray-700 hover:text-techblue-600 font-medium">Help</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
