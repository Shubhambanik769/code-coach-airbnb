import { useState } from 'react';
const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Handle training search logic here
      console.log('Searching for:', searchQuery);
    }
  };
  const trainingCategories = [{
    name: "Technology & IT Skills",
    icon: "💻"
  }, {
    name: "Business & Entrepreneurship",
    icon: "💼"
  }, {
    name: "Soft Skills & Personality Development",
    icon: "👥"
  }, {
    name: "Tools & Productivity Software",
    icon: "🔧"
  }, {
    name: "Language & Communication",
    icon: "🗣️"
  }, {
    name: "Career Skills & Placement Prep",
    icon: "🎯"
  }, {
    name: "Faculty Development / Train-the-Trainer",
    icon: "👨‍🏫"
  }, {
    name: "Creative Skills",
    icon: "🎨"
  }, {
    name: "Wellness & Productivity",
    icon: "🧘"
  }, {
    name: "Finance & Investing",
    icon: "💰"
  }, {
    name: "HR & Leadership",
    icon: "👑"
  }];
  return <section className="bg-white">
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
                {trainingCategories.map((category, index) => <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                  </div>)}
              </div>
            </div>

            {/* Training Search */}
            
          </div>

          {/* Right Side - Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop" alt="Corporate training session" className="w-full h-48 object-cover rounded-lg" />
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=250&fit=crop" alt="Online training" className="w-full h-60 object-cover rounded-lg" />
            </div>
            <div className="space-y-4 pt-8">
              <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=250&fit=crop" alt="Skills development" className="w-full h-60 object-cover rounded-lg" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop" alt="Professional training" className="w-full h-48 object-cover rounded-lg" />
            </div>
          </div>
        </div>

        {/* Ratings and Reviews Section */}
        <div className="mt-20 py-16 bg-gray-50 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by thousands of learners
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join over 10,000+ satisfied learners who have transformed their careers with our expert trainers
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">4.9</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <div className="text-gray-600 text-sm">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-gray-600 text-sm">Happy Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600 text-sm">Expert Trainers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600 text-sm">Success Rate</div>
            </div>
          </div>

          {/* Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="Reviewer" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Rajesh Kumar</div>
                  <div className="text-sm text-gray-600">Software Engineer</div>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 text-sm">
                "Excellent React training! The trainer was very knowledgeable and explained complex concepts in simple terms. Got a job offer within 2 months!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face" alt="Reviewer" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-sm text-gray-600">Data Analyst</div>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 text-sm">
                "Amazing Python and Data Science course! Hands-on approach with real projects. The trainer was patient and supportive throughout."
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Reviewer" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Amit Patel</div>
                  <div className="text-sm text-gray-600">Marketing Manager</div>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 text-sm">
                "Digital marketing training was spot-on! Learned practical strategies that I implemented immediately. Revenue increased by 40%!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;