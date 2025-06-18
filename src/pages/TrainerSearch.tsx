import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Header from '@/components/Header';
import TrainerCard from '@/components/TrainerCard';

interface TrainerWithProfile {
  id: string;
  title: string;
  specialization: string;
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  skills: string[];
  bio: string;
  location: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

const TrainerSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSpecialization, setSelectedSpecialization] = useState(searchParams.get('specialization') || '');
  const [selectedExperience, setSelectedExperience] = useState(searchParams.get('experience') || '');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get('q');
    const specialization = searchParams.get('specialization');
    const experience = searchParams.get('experience');
    
    if (q) setSearchQuery(q);
    if (specialization) setSelectedSpecialization(specialization);
    if (experience) setSelectedExperience(experience);
  }, [searchParams]);

  // Enhanced search matching function
  const createSearchableText = (trainer: any) => {
    const searchableFields = [
      trainer.name,
      trainer.title,
      trainer.specialization,
      trainer.bio,
      trainer.location,
      ...(trainer.skills || []),
      ...(trainer.tags || [])
    ].filter(Boolean);
    
    return searchableFields.join(' ').toLowerCase();
  };

  // Improved search term matching with AWS-specific keywords
  const matchesSearchTerm = (trainer: any, searchTerm: string) => {
    if (!searchTerm) return true;
    
    const searchableText = createSearchableText(trainer);
    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    
    return searchWords.some(word => {
      // Direct match
      if (searchableText.includes(word)) return true;
      
      // Handle common tech abbreviations
      const techMappings: { [key: string]: string[] } = {
        'aws': ['amazon web services', 'amazon', 'cloud', 'solution architect'],
        'gcp': ['google cloud platform', 'google cloud'],
        'azure': ['microsoft azure', 'microsoft cloud'],
        'devops': ['dev ops', 'development operations']
      };
      
      if (techMappings[word]) {
        return techMappings[word].some(variation => searchableText.includes(variation));
      }
      
      return false;
    });
  };

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['trainers-search', searchQuery, selectedSpecialization, selectedExperience, priceRange, selectedSkills],
    queryFn: async () => {
      console.log('Fetching all trainers with filters:', { searchQuery, selectedSpecialization, selectedExperience, priceRange, selectedSkills });
      
      // Fix the foreign key reference
      let query = supabase
        .from('trainers')
        .select(`
          *,
          profiles!fk_trainers_user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved');

      if (selectedSpecialization) {
        query = query.ilike('specialization', `%${selectedSpecialization}%`);
      }

      if (selectedExperience) {
        const minExperience = parseInt(selectedExperience);
        query = query.gte('experience_years', minExperience);
      }

      query = query
        .gte('hourly_rate', priceRange[0])
        .lte('hourly_rate', priceRange[1]);

      if (selectedSkills.length > 0) {
        query = query.contains('skills', selectedSkills);
      }

      const { data, error } = await query.order('rating', { ascending: false });
      
      if (error) {
        console.error('Error fetching trainers:', error);
        throw error;
      }

      console.log('Raw trainers data:', data?.length || 0);

      // Apply search query filtering client-side for better keyword matching
      if (searchQuery && data) {
        const filtered = data.filter(trainer => matchesSearchTerm(trainer, searchQuery));
        console.log(`After search filtering: ${filtered.length} trainers`);
        return filtered;
      }

      return data || [];
    }
  });

  const { data: specializations = [] } = useQuery({
    queryKey: ['specializations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('specialization')
        .not('specialization', 'is', null);
      
      if (error) throw error;
      
      const unique = [...new Set(data.map(item => item.specialization))];
      return unique.filter(Boolean);
    }
  });

  const { data: allSkills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('skills')
        .not('skills', 'is', null);
      
      if (error) throw error;
      
      const skills = data.flatMap(item => item.skills || []);
      return [...new Set(skills)];
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedSpecialization) params.set('specialization', selectedSpecialization);
    if (selectedExperience) params.set('experience', selectedExperience);
    setSearchParams(params);
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
    setSelectedExperience('');
    setPriceRange([0, 200]);
    setSelectedSkills([]);
    setSearchParams({});
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
  };

  const handleExperienceChange = (value: string) => {
    setSelectedExperience(value);
    updateURL();
  };

  const getSuggestedKeywords = () => {
    const keywords = new Set<string>();
    trainers.forEach(trainer => {
      if (trainer.skills) trainer.skills.forEach((skill: string) => keywords.add(skill));
      if (trainer.specialization) keywords.add(trainer.specialization);
    });
    return Array.from(keywords).slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Trainer</h1>
          
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by expertise, skills, or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" className="bg-techblue-600 hover:bg-techblue-700 h-12 px-8">
              Search
            </Button>
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="h-12">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </form>

          {/* Suggested Keywords */}
          {!searchQuery && getSuggestedKeywords().length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Popular skills:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedKeywords().map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => setSearchQuery(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleContent>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Advanced Filters
                    </span>
                    <Button variant="ghost" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any specialization</SelectItem>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Experience
                      </label>
                      <Select value={selectedExperience} onValueChange={handleExperienceChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any experience</SelectItem>
                          <SelectItem value="1">1+ years</SelectItem>
                          <SelectItem value="3">3+ years</SelectItem>
                          <SelectItem value="5">5+ years</SelectItem>
                          <SelectItem value="10">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate: ${priceRange[0]} - ${priceRange[1]}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={handlePriceRangeChange}
                        max={200}
                        min={0}
                        step={10}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills
                      </label>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {allSkills.slice(0, 10).map((skill) => (
                          <Badge
                            key={skill}
                            variant={selectedSkills.includes(skill) ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleSkillToggle(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {trainers.length} trainers found
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select defaultValue="rating">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Trainers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trainers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerSearch;
