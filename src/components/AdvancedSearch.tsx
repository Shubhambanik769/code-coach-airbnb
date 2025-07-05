import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Filter, X, Search } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

interface SearchFilters {
  query: string;
  location: string;
  skills: string[];
  experience: [number, number];
  hourlyRate: [number, number];
  availability: string;
  rating: number;
  specialization: string;
}

const AdvancedSearch = ({ onSearch, onReset }: AdvancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    skills: [],
    experience: [0, 20],
    hourlyRate: [0, 5000],
    availability: '',
    rating: 0,
    specialization: ''
  });

  const popularSkills = [
    'React', 'Python', 'AWS', 'Machine Learning', 'DevOps', 
    'JavaScript', 'Data Science', 'Cloud Computing', 'Docker', 
    'Kubernetes', 'TypeScript', 'Node.js'
  ];

  const specializations = [
    'Web Development', 'Cloud Computing', 'Data Science', 
    'Cybersecurity', 'Mobile Development', 'DevOps', 
    'AI/ML', 'Blockchain'
  ];

  const handleSkillToggle = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      location: '',
      skills: [],
      experience: [0, 20],
      hourlyRate: [0, 5000],
      availability: '',
      rating: 0,
      specialization: ''
    });
    onReset();
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return value > 0;
    return false;
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-blue-600">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Search Filters
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Search */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-query">Search Query</Label>
              <Input
                id="search-query"
                placeholder="Keywords, technologies..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City or Remote"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Skills & Technologies</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 text-sm rounded-full border transition-all ${
                    filters.skills.includes(skill)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {skill}
                  {filters.skills.includes(skill) && (
                    <X className="inline-block ml-1 h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Specialization */}
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Select
              value={filters.specialization}
              onValueChange={(value) => setFilters(prev => ({ ...prev, specialization: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Range */}
          <div>
            <Label>Experience (Years)</Label>
            <div className="mt-4 mb-2">
              <Slider
                value={filters.experience}
                onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value as [number, number] }))}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.experience[0]} years</span>
              <span>{filters.experience[1]}+ years</span>
            </div>
          </div>

          {/* Hourly Rate Range */}
          <div>
            <Label>Hourly Rate (₹)</Label>
            <div className="mt-4 mb-2">
              <Slider
                value={filters.hourlyRate}
                onValueChange={(value) => setFilters(prev => ({ ...prev, hourlyRate: value as [number, number] }))}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{filters.hourlyRate[0]}</span>
              <span>₹{filters.hourlyRate[1]}+</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <Label htmlFor="rating">Minimum Rating</Label>
            <Select
              value={filters.rating.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div>
            <Label htmlFor="availability">Availability</Label>
            <Select
              value={filters.availability}
              onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Availability</SelectItem>
                <SelectItem value="immediate">Available Immediately</SelectItem>
                <SelectItem value="within-week">Within a Week</SelectItem>
                <SelectItem value="within-month">Within a Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSearch} className="flex-1 btn-primary">
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearch;