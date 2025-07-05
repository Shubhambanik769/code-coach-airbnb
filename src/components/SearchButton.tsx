
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const SearchButton = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (location.trim()) params.set('location', location.trim());
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate(`/search?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const popularKeywords = [
    'React', 'Python', 'AWS', 'Machine Learning', 'DevOps', 'JavaScript', 'Data Science', 'Cloud Computing'
  ];

  const handleKeywordClick = async (keyword: string) => {
    setIsLoading(true);
    setSearchQuery(keyword);
    
    try {
      const params = new URLSearchParams();
      params.set('q', keyword);
      if (location.trim()) params.set('location', location.trim());
      
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate(`/search?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-3 max-w-4xl mx-auto mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
          <Input
            type="text"
            placeholder="Search trainers, skills, technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm focus:shadow-md transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <div className="relative flex-1 w-full lg:max-w-xs">
          <Input
            type="text"
            placeholder="Location or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-14 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm focus:shadow-md transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          className="btn-primary h-14 px-8 w-full lg:w-auto rounded-xl font-semibold text-base"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Search Trainers
            </>
          )}
        </Button>
      </form>
      
      {/* Popular Keywords */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3 font-medium">Popular searches:</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          {popularKeywords.map((keyword) => (
            <button
              key={keyword}
              onClick={() => handleKeywordClick(keyword)}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchButton;
