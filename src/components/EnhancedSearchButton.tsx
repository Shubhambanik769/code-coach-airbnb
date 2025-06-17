
import { useState } from 'react';
import { Search, MapPin, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';

const categories = [
  'Web Development', 'Mobile Development', 'DevOps', 'Cloud Computing',
  'Data Science', 'Machine Learning', 'Cybersecurity', 'UI/UX Design',
  'Project Management', 'Digital Marketing', 'Business Analysis'
];

const locations = [
  'Remote', 'New York', 'San Francisco', 'London', 'Toronto', 
  'Sydney', 'Singapore', 'Berlin', 'Mumbai', 'Bangalore'
];

const EnhancedSearchButton = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [experience, setExperience] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only search if there's actual content
    if (!searchQuery.trim() && !location && !category && experience === '' && priceRange[0] === 0 && priceRange[1] === 200) {
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    if (experience) params.set('experience', experience);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 200) params.set('maxPrice', priceRange[1].toString());
    
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setCategory('');
    setPriceRange([0, 200]);
    setExperience('');
  };

  const hasActiveFilters = location || category || experience || priceRange[0] > 0 || priceRange[1] < 200;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by skills, expertise, or trainer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-2 border-gray-200 focus:border-techblue-500"
            />
          </div>
          
          <div className="relative flex-1 w-full sm:max-w-xs">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-10 h-12 border-2 border-gray-200">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="">Any Location</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="bg-techblue-600 hover:bg-techblue-700 h-12 px-8"
              disabled={!searchQuery.trim() && !location && !category && experience === '' && priceRange[0] === 0 && priceRange[1] === 200}
            >
              Search
            </Button>
            
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="h-12 px-4 relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-techblue-600 text-white text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent>
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="text-sm">
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="border-2 border-gray-200">
                        <SelectValue placeholder="Any Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        <SelectItem value="">Any Category</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger className="border-2 border-gray-200">
                        <SelectValue placeholder="Any Experience" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        <SelectItem value="">Any Experience</SelectItem>
                        <SelectItem value="1">1+ years</SelectItem>
                        <SelectItem value="3">3+ years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                        <SelectItem value="10">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={200}
                      min={0}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {location && (
                        <Badge variant="secondary" className="bg-techblue-100 text-techblue-800">
                          Location: {location}
                        </Badge>
                      )}
                      {category && (
                        <Badge variant="secondary" className="bg-techblue-100 text-techblue-800">
                          Category: {category}
                        </Badge>
                      )}
                      {experience && (
                        <Badge variant="secondary" className="bg-techblue-100 text-techblue-800">
                          Experience: {experience}+ years
                        </Badge>
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < 200) && (
                        <Badge variant="secondary" className="bg-techblue-100 text-techblue-800">
                          Rate: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </form>
    </div>
  );
};

export default EnhancedSearchButton;
