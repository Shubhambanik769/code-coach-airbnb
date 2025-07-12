import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Star, Clock, Users, CheckCircle, ShoppingCart, Badge, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import PackageCustomizer from '@/components/PackageCustomizer';

const CategoryPage = () => {
  const { slug } = useParams();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizingPackage, setCustomizingPackage] = useState(null);

  // Convert slug back to readable category name
  const categoryName = slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Training';

  // Domain-based course fields mapping
  const getDomainCourses = (category) => {
    const domainMap = {
      'Technology IT Skills': [
        { name: 'Cloud Computing', icon: '☁️' },
        { name: 'Data Structures & Algorithms', icon: '🔧' },
        { name: 'Cybersecurity', icon: '🔒' },
        { name: 'Web Development', icon: '💻' },
        { name: 'Mobile App Development', icon: '📱' },
        { name: 'DevOps & CI/CD', icon: '🚀' },
        { name: 'Machine Learning', icon: '🤖' },
        { name: 'Blockchain Development', icon: '⛓️' }
      ],
      'Business Entrepreneurship': [
        { name: 'Financial Planning', icon: '📊' },
        { name: 'Digital Marketing', icon: '📈' },
        { name: 'Project Management', icon: '📋' },
        { name: 'Leadership Skills', icon: '👥' },
        { name: 'Business Analytics', icon: '📊' },
        { name: 'Startup Management', icon: '🚀' },
        { name: 'Investment & Trading', icon: '💰' },
        { name: 'Operations Management', icon: '⚙️' }
      ],
      'Creative Design': [
        { name: 'UI/UX Design', icon: '🎨' },
        { name: 'Graphic Design', icon: '🖼️' },
        { name: 'Video Editing', icon: '🎬' },
        { name: 'Photography', icon: '📸' },
        { name: 'Motion Graphics', icon: '🎞️' },
        { name: 'Brand Design', icon: '🏷️' },
        { name: 'Web Design', icon: '🌐' },
        { name: 'Product Design', icon: '🛍️' }
      ],
      'Health Wellness': [
        { name: 'Nutrition & Diet', icon: '🥗' },
        { name: 'Fitness Training', icon: '💪' },
        { name: 'Mental Health', icon: '🧠' },
        { name: 'Yoga & Meditation', icon: '🧘' },
        { name: 'Sports Training', icon: '⚽' },
        { name: 'Healthcare Management', icon: '🏥' },
        { name: 'Alternative Medicine', icon: '🌿' },
        { name: 'Personal Development', icon: '✨' }
      ],
      'Languages Communication': [
        { name: 'English Speaking', icon: '🗣️' },
        { name: 'Public Speaking', icon: '🎤' },
        { name: 'Business Writing', icon: '✍️' },
        { name: 'Foreign Languages', icon: '🌍' },
        { name: 'Presentation Skills', icon: '📽️' },
        { name: 'Communication Skills', icon: '💬' },
        { name: 'Creative Writing', icon: '📝' },
        { name: 'Interview Skills', icon: '🤝' }
      ],
      'Professional Skills': [
        { name: 'Excel Mastery', icon: '📊' },
        { name: 'Data Analysis', icon: '📈' },
        { name: 'Time Management', icon: '⏰' },
        { name: 'Career Development', icon: '🎯' },
        { name: 'Soft Skills', icon: '🤝' },
        { name: 'Sales Training', icon: '💼' },
        { name: 'Customer Service', icon: '🛎️' },
        { name: 'Team Management', icon: '👥' }
      ]
    };
    
    return domainMap[category] || [
      { name: 'Foundation Course', icon: '📚' },
      { name: 'Advanced Topics', icon: '🎓' },
      { name: 'Practical Projects', icon: '🔨' },
      { name: 'Industry Certification', icon: '🏆' },
      { name: 'Career Guidance', icon: '🎯' },
      { name: 'Mock Interviews', icon: '💼' }
    ];
  };

  const subcategories = getDomainCourses(categoryName);

  // Sample training packages
  const packages = [
    {
      id: 1,
      title: `Complete ${categoryName} Bootcamp`,
      rating: 4.85,
      reviews: 3900,
      originalPrice: 15000,
      discountedPrice: 12000,
      duration: '8 weeks',
      includes: [
        'Live interactive sessions',
        'Hands-on projects',
        'Industry certification',
        'Job placement assistance'
      ],
      excludes: ['Hardware/Software licenses', 'Personal mentoring'],
      savings: 3000
    },
    {
      id: 2,
      title: `${categoryName} Fundamentals`,
      rating: 4.72,
      reviews: 2100,
      originalPrice: 8000,
      discountedPrice: 6500,
      duration: '4 weeks',
      includes: [
        'Foundation concepts',
        'Practice exercises',
        'Course completion certificate'
      ],
      excludes: ['Advanced modules', 'Job placement'],
      savings: 1500
    }
  ];

  const addToCart = (pkg) => {
    setCart([...cart, pkg]);
  };

  const handleCustomizePackage = (pkg) => {
    setCustomizingPackage(pkg);
    setShowCustomizer(true);
  };

  const handleAddCustomizedToCart = (customizedPackage) => {
    setCart([...cart, customizedPackage]);
  };

  const getTotalSavings = () => {
    return cart.reduce((total, item) => total + item.savings, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Select Course</h3>
              <div className="space-y-3">
                {subcategories.map((subcat, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-3 rounded-lg border hover:border-primary cursor-pointer transition-colors"
                  >
                    <span className="text-2xl mr-3">{subcat.icon}</span>
                    <span className="text-sm font-medium">{subcat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Central Section - Packages */}
          <div className="lg:col-span-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{categoryName} Packages</h1>
              <p className="text-gray-600">Choose the perfect training program for your goals</p>
            </div>

            <div className="space-y-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">PACKAGE</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm font-medium">{pkg.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({pkg.reviews.toLocaleString()} reviews)</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center text-lg font-bold">
                            <span className="text-gray-900">₹{pkg.discountedPrice.toLocaleString()}</span>
                            <span className="text-gray-500 line-through ml-2 text-sm">₹{pkg.originalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {pkg.duration}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => addToCart(pkg)}
                        className="ml-4"
                      >
                        Add
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
                        <ul className="space-y-1">
                          {pkg.includes.map((item, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {pkg.excludes && pkg.excludes.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Excludes:</h4>
                          <ul className="space-y-1">
                            {pkg.excludes.map((item, index) => (
                              <li key={index} className="text-sm text-gray-500">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => handleCustomizePackage(pkg)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Customize your package
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Cart */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
              </h3>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">No items in cart</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="border-b pb-3">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">1 program</span>
                        <span className="font-medium">₹{item.discountedPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  
                  {getTotalSavings() > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-700 text-sm font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Congratulations! ₹{getTotalSavings().toLocaleString()} saved so far!
                      </p>
                    </div>
                  )}
                  
                  <Button className="w-full">
                    ₹{cart.reduce((total, item) => total + item.discountedPrice, 0).toLocaleString()} View Cart
                  </Button>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Up to ₹500 Cashback
                    </p>
                    <p className="text-xs text-green-600">Valid for UPI payments only</p>
                  </div>
                </div>
              )}
              
              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Skilloop Promise</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    4.5+ Rated Trainers
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Industry-Standard Training
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Certified Programs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Package Customizer Modal */}
      <PackageCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        packageData={customizingPackage}
        onAddToCart={handleAddCustomizedToCart}
      />
    </div>
  );
};

export default CategoryPage;