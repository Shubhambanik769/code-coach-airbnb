
import { Globe, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'TechTrainer',
      links: [
        'About us',
        'Careers',
        'Press',
        'Blog',
        'Help Center',
        'Contact us'
      ]
    },
    {
      title: 'For Trainers',
      links: [
        'Become a trainer',
        'Trainer resources',
        'Community standards',
        'Trainer protection',
        'Success stories'
      ]
    },
    {
      title: 'For Companies',
      links: [
        'Enterprise solutions',
        'Team training',
        'Custom curricula',
        'Volume discounts',
        'API access'
      ]
    },
    {
      title: 'Technologies',
      links: [
        'Web Development',
        'Cloud Computing',
        'Data Science',
        'Cybersecurity',
        'Mobile Development',
        'DevOps'
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TT</span>
              </div>
              <span className="text-xl font-bold">TechTrainer</span>
            </div>
            <p className="text-gray-400 mb-6">
              Connecting companies with expert IT trainers for personalized technology education.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language and Currency */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
                <span>English (US)</span>
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                $ USD
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              Need help? Visit our{' '}
              <a href="#" className="text-white hover:underline">
                Help Center
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2024 TechTrainer, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
