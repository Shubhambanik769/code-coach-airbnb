import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, Clock, Users, CheckCircle, ShoppingCart, Badge, Settings, Code, Smartphone, BarChart3, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import PackageCustomizer from '@/components/PackageCustomizer';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizingPackage, setCustomizingPackage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, getTotalItems, getTotalPrice, getTotalSavings } = useCart();

  // Convert slug back to readable category name
  const categoryName = slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Training';

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

  useEffect(() => {
    const fetchCourses = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const { data: categories, error } = await supabase
          .from('service_categories')
          .select('subcategories')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching category:', error);
          setCourses([]);
          return;
        }

        if (categories && categories.subcategories) {
          setCourses(categories.subcategories);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [slug]);

  // Fetch category details for icon and name
  const [categoryDetails, setCategoryDetails] = useState(null);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!slug) return;
      
      try {
        const { data: category, error } = await supabase
          .from('service_categories')
          .select('name, icon_name')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching category details:', error);
          return;
        }

        setCategoryDetails(category);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCategoryDetails();
  }, [slug]);

  const handleAddToCart = (pkg) => {
    const cartItem = {
      id: `${Date.now()}-${pkg.id}`,
      title: pkg.title,
      originalPrice: pkg.originalPrice,
      discountedPrice: pkg.discountedPrice,
      savings: pkg.savings,
      duration: pkg.duration,
      includes: pkg.includes,
      excludes: pkg.excludes
    };
    
    addToCart(cartItem);
  };

  const handleCustomizePackage = (pkg) => {
    setCustomizingPackage(pkg);
    setShowCustomizer(true);
  };

  const handleAddCustomizedToCart = (customizedPackage) => {
    const cartItem = {
      id: `${Date.now()}-${customizedPackage.id}`,
      title: customizedPackage.title,
      originalPrice: customizedPackage.originalPrice || customizedPackage.basePrice,
      discountedPrice: customizedPackage.discountedPrice,
      finalPrice: customizedPackage.finalPrice,
      savings: customizedPackage.savings,
      duration: customizedPackage.duration,
      includes: customizedPackage.includes,
      excludes: customizedPackage.excludes,
      customization: customizedPackage.customization
    };
    
    addToCart(cartItem);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Courses */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Select Course</h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course, index) => {
                    const IconComponent = categoryDetails?.icon_name === 'Code' ? Code :
                                        categoryDetails?.icon_name === 'Smartphone' ? Smartphone :
                                        categoryDetails?.icon_name === 'BarChart3' ? BarChart3 :
                                        categoryDetails?.icon_name === 'Cloud' ? Cloud : Code;
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center p-3 rounded-lg border hover:border-primary cursor-pointer transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mr-3">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{course}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No courses available for this category</p>
                </div>
              )}
            </div>
          </div>

          {/* Central Section - Packages */}
          <div className="lg:col-span-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {categoryDetails?.name || categoryName} Packages
              </h1>
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

                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => handleAddToCart(pkg)}
                        className="flex-1"
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleCustomizePackage(pkg)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                    </div>
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
                Cart ({getTotalItems()})
              </h3>
              
              {getTotalItems() === 0 ? (
                <p className="text-gray-500 text-sm">No items in cart</p>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} added
                  </div>
                  
                  {getTotalSavings() > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-700 text-sm font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Congratulations! ₹{getTotalSavings().toLocaleString()} saved so far!
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/cart')}
                  >
                    ₹{getTotalPrice().toLocaleString()} View Cart
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
