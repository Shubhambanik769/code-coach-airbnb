
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrainerCardProps {
  trainer: {
    id: string;
    title: string;
    specialization: string;
    experience_years: number;
    hourly_rate: number;
    rating: number;
    total_reviews: number;
    skills: string[];
    location: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    } | null;
  };
}

const TrainerCard = ({ trainer }: TrainerCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trainer/${trainer.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200" 
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={trainer.profiles?.avatar_url} />
            <AvatarFallback className="bg-techblue-100 text-techblue-600 font-semibold">
              {trainer.profiles?.full_name?.split(' ').map(n => n[0]).join('') || trainer.title?.charAt(0) || 'T'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {trainer.profiles?.full_name || trainer.title || 'Professional Trainer'}
              </h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{trainer.rating}</span>
                <span className="text-sm text-gray-500">({trainer.total_reviews})</span>
              </div>
            </div>
            
            <p className="text-sm text-techblue-600 font-medium mb-1">{trainer.title}</p>
            <p className="text-sm text-gray-600 mb-3">{trainer.specialization}</p>
            
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{trainer.location || 'Remote'}</span>
              </div>
              <span className="text-sm text-gray-500">
                {trainer.experience_years}+ years exp
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {trainer.skills?.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {trainer.skills?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{trainer.skills.length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-techblue-600">
                ${trainer.hourly_rate}/hr
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainerCard;
