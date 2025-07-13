import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, Clock, Users, CheckCircle, ShoppingCart, Settings, Code, Smartphone, BarChart3, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const [packages, setPackages] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const { addToCart, getTotalItems, getTotalPrice, getTotalSavings } = useCart();

  // Convert slug back to readable category name
  const categoryName = slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Training';

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Fetch category details and subcategories
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (categoryError) {
          console.error('Error fetching category:', categoryError);
          setCourses([]);
          setCategoryDetails(null);
          return;
        }

        if (category) {
          setCategoryDetails(category);
          setCourses(category.subcategories || []);
          
          // Fetch packages for this category
          const { data: packagesData, error: packagesError } = await supabase
            .from('packages')
            .select(`
              *,
              service_categories(name, slug),
              package_customization_options(*)
            `)
            .eq('category_id', category.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (packagesError) {
            console.error('Error fetching packages:', packagesError);
            setPackages([]);
          } else {
            setPackages(packagesData || []);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setCourses([]);
        setPackages([]);
        setCategoryDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  // Filter packages by selected subcategory
  const filteredPackages = selectedSubcategory 
    ? packages.filter(pkg => pkg.subcategory === selectedSubcategory)
    : packages;

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(selectedSubcategory === subcategory ? '' : subcategory);
  };

  const handleAddToCart = (pkg) => {
    const cartItem = {
      id: `${Date.now()}-${pkg.id}`,
      title: pkg.title,
      originalPrice: pkg.base_price,
      discountedPrice: pkg.discounted_price || pkg.base_price,
      savings: pkg.discounted_price ? pkg.base_price - pkg.discounted_price : 0,
      duration: pkg.duration,
      includes: pkg.includes || [],
      excludes: pkg.excludes || []
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

  const getIconComponent = () => {
    switch (categoryDetails?.icon_name) {
      case 'Code': return Code;
      case 'Smartphone': return Smartphone;
      case 'BarChart3': return BarChart3;
      case 'Cloud': return Cloud;
      default: return Code;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Courses/Subcategories */}
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
                    const IconComponent = getIconComponent();
                    const isSelected = selectedSubcategory === course;
                    const packageCount = packages.filter(pkg => pkg.subcategory === course).length;
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => handleSubcategoryClick(course)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors group ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 transition-colors ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                            {course}
                          </span>
                        </div>
                        {packageCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {packageCount}
                          </Badge>
                        )}
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
                {selectedSubcategory && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    - {selectedSubcategory}
                  </span>
                )}
              </h1>
              <p className="text-gray-600">Choose the perfect training program for your goals</p>
              {selectedSubcategory && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedSubcategory('')}
                  className="mt-2"
                >
                  View All Packages
                </Button>
              )}
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <Card key={pkg.id} className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-green-100 text-green-800 text-xs">PACKAGE</Badge>
                            <Badge variant="outline" className="text-xs">{pkg.subcategory}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                          {pkg.description && (
                            <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                          )}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center text-lg font-bold">
                              <span className="text-gray-900">
                                ₹{(pkg.discounted_price || pkg.base_price).toLocaleString()}
                              </span>
                              {pkg.discounted_price && pkg.discounted_price !== pkg.base_price && (
                                <span className="text-gray-500 line-through ml-2 text-sm">
                                  ₹{pkg.base_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {pkg.duration && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {pkg.duration}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {pkg.includes && pkg.includes.length > 0 && (
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
                            <ul className="space-y-1">
                              {pkg.includes.slice(0, 4).map((item, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                              {pkg.includes.length > 4 && (
                                <li className="text-sm text-gray-500 ml-6">
                                  +{pkg.includes.length - 4} more features
                                </li>
                              )}
                            </ul>
                          </div>
                          
                          {pkg.excludes && pkg.excludes.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Excludes:</h4>
                              <ul className="space-y-1">
                                {pkg.excludes.map((item, index) => (
                                  <li key={index} className="text-sm text-gray-500 ml-6">
                                    • {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button 
                          onClick={() => handleAddToCart(pkg)}
                          className="flex-1"
                        >
                          Add to Cart
                        </Button>
                        {pkg.package_customization_options && pkg.package_customization_options.length > 0 && (
                          <Button 
                            variant="outline" 
                            onClick={() => handleCustomizePackage(pkg)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Customize
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {selectedSubcategory 
                      ? `No packages available for ${selectedSubcategory}` 
                      : 'No packages available for this category'
                    }
                  </p>
                </div>
              )}
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