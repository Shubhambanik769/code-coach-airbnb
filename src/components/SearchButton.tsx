
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const SearchButton = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search trainers, skills, technologies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Input
          type="text"
          placeholder="Location or Remote"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-12"
        />
      </div>
      <Button type="submit" className="bg-techblue-600 hover:bg-techblue-700 h-12 px-8 w-full sm:w-auto">
        Search Trainers
      </Button>
    </form>
  );
};

export default SearchButton;
