
import { useState } from 'react';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Handle training search logic here
      console.log('Searching for:', searchQuery);
    }
  };

  const trainingCategories = [
    { name: "Technology & IT Skills", icon: "💻" },
    { name: "Business & Entrepreneurship", icon: "💼" },
    { name: "Soft Skills & Personality Development", icon: "👥" },
    { name: "Tools & Productivity Software", icon: "🔧" },
    { name: "Language & Communication", icon: "🗣️" },
    { name: "Career Skills & Placement Prep", icon: "🎯" },
    { name: "Faculty Development / Train-the-Trainer", icon: "👨‍🏫" },
    { name: "Creative Skills", icon: "🎨" },
    { name: "Wellness & Productivity", icon: "🧘" },
    { name: "Finance & Investing", icon: "💰" },
    { name: "HR & Leadership", icon: "👑" }
  ];

  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Content and Categories */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Training services at your doorstep
            </h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                What are you looking for?
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {trainingCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Search */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-gray-900 font-semibold mb-4">
                Search for Training
              </h3>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What training are you looking for?"
                className="w-full h-12 px-4 text-gray-600 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              
              <button
                onClick={handleSearch}
                className="w-full mt-4 bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Search Training
              </button>
            </div>
          </div>

          {/* Right Side - Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
                alt="Corporate training session"
                className="w-full h-48 object-cover rounded-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=250&fit=crop"
                alt="Online training"
                className="w-full h-60 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=250&fit=crop"
                alt="Skills development"
                className="w-full h-60 object-cover rounded-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop"
                alt="Professional training"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
