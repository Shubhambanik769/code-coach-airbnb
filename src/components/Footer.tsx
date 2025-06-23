import { Globe, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  
  const footerSections = [
    {
      title: 'Skilloop.io',
      links: [
        { name: 'About us', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Success stories', path: '/success-stories' },
        { name: 'Press', path: '#' },
        { name: 'Blog', path: '#' },
        { name: 'Help Center', path: '#' },
        { name: 'Contact us', path: '#' }
      ]
    },
    {
      title: 'For Trainers',
      links: [
        { name: 'Become a trainer', path: '/apply-trainer' },
        { name: 'Trainer resources', path: '/trainer-resources' },
        { name: 'Community standards', path: '/community-standards' },
        { name: 'Trainer protection', path: '/trainer-protection' },
        { name: 'Success stories', path: '/success-stories' }
      ]
    },
    {
      title: 'For Companies',
      links: [
        { name: 'Enterprise solutions', path: '#' },
        { name: 'Team training', path: '#' },
        { name: 'Custom curricula', path: '#' },
        { name: 'Volume discounts', path: '#' },
        { name: 'API access', path: '#' }
      ]
    },
    {
      title: 'Technologies',
      links: [
        { name: 'Web Development', path: '/technology/web-development' },
        { name: 'Cloud Computing', path: '/technology/cloud-computing' },
        { name: 'Data Science', path: '/technology/data-science' },
        { name: 'Cybersecurity', path: '/technology/cybersecurity' },
        { name: 'Mobile Development', path: '/technology/mobile-development' },
        { name: 'DevOps', path: '/technology/devops' }
      ]
    }
  ];

  const handleLinkClick = (path: string) => {
    if (path === '#') return;
    navigate(path);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">SL</span>
              </div>
              <span className="text-lg sm:text-xl font-bold">Skilloop.io</span>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              Connecting companies with expert technology trainers for personalized learning experiences.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">{section.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button 
                      onClick={() => handleLinkClick(link.path)}
                      className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language and Currency */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>English (US)</span>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors text-sm">
                $ USD
              </button>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-400">
              Need help? Visit our{' '}
              <a href="#" className="text-white hover:underline">
                Help Center
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex flex-wrap justify-start space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-400">
              © 2024 Skilloop.io, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
