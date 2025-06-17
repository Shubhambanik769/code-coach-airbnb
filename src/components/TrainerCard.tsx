
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrainerCardProps {
  trainer: {
    id: string;
    name: string;
    title: string;
    specialization?: string;
    location?: string;
    hourly_rate?: number;
    rating?: number;
    total_reviews?: number;
    bio?: string;
    skills?: string[];
    experience_years?: number;
    tags?: string[];
    profiles?: {
      avatar_url?: string;
      full_name?: string;
    };
  };
  onSelect?: (trainerId: string) => void;
}

const TrainerCard = ({ trainer, onSelect }: TrainerCardProps) => {
  const navigate = useNavigate();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRecommendationRate = () => {
    if (!trainer.rating || trainer.rating === 0) return 0;
    return Math.round((trainer.rating / 5) * 100);
  };

  const getBadgeText = () => {
    if (trainer.tags && trainer.tags.length > 0) {
      return trainer.tags[0];
    }
    
    const rating = trainer.rating || 0;
    if (rating >= 4.8) return 'Top Rated';
    if (rating >= 4.5) return 'Expert';
    if (rating >= 4.0) return 'Pro';
    return 'New';
  };

  const getBadgeColor = () => {
    if (trainer.tags && trainer.tags.length > 0) {
      return 'bg-blue-500 text-white';
    }
    
    const rating = trainer.rating || 0;
    if (rating >= 4.8) return 'bg-green-500 text-white';
    if (rating >= 4.5) return 'bg-blue-500 text-white';
    if (rating >= 4.0) return 'bg-purple-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const handleViewProfile = () => {
    console.log('TrainerCard: Navigating to trainer profile:', trainer.id);
    if (onSelect) {
      onSelect(trainer.id);
    } else {
      navigate(`/trainer/${trainer.id}`);
    }
  };

  // Create proper avatar URL from profiles data - now accessible to all users
  const avatarUrl = trainer.profiles?.avatar_url 
    ? `https://rnovcrcvhaeuudqkymiw.supabase.co/storage/v1/object/public/avatars/${trainer.profiles.avatar_url}`
    : null;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={avatarUrl} 
                alt={trainer.profiles?.full_name || trainer.name}
              />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {trainer.profiles?.full_name || trainer.name}
                </h3>
                <Badge className={getBadgeText() === 'New' ? '' : getBadgeColor()}>
                  {getBadgeText()}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-2 truncate">{trainer.title}</p>
              
              {/* Rating and Reviews - now visible to all users */}
              {trainer.rating && trainer.rating > 0 ? (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(trainer.rating)}
                    <span className="text-sm font-medium text-gray-700">
                      {trainer.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ({trainer.total_reviews || 0} {trainer.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(0)}
                    <span className="text-sm font-medium text-gray-500">New trainer</span>
                  </div>
                  <span className="text-xs text-gray-500">(No reviews yet)</span>
                </div>
              )}

              {/* Recommendation Rate */}
              {trainer.total_reviews && trainer.total_reviews > 0 && trainer.rating && trainer.rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    {getRecommendationRate()}% would recommend
                  </span>
                </div>
              )}

              {/* Experience */}
              {trainer.experience_years && (
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {trainer.experience_years}+ years experience
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right ml-4">
            <p className="text-lg font-bold text-blue-600">
              ${trainer.hourly_rate || 0}
            </p>
            <p className="text-xs text-gray-500">per hour</p>
          </div>
        </div>

        {trainer.specialization && (
          <Badge variant="secondary" className="mb-3">
            {trainer.specialization}
          </Badge>
        )}

        {trainer.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            {trainer.location}
          </div>
        )}

        {trainer.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {trainer.bio}
          </p>
        )}

        {trainer.skills && trainer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {trainer.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {trainer.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trainer.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Additional Tags */}
        {trainer.tags && trainer.tags.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {trainer.tags.slice(1, 4).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button
          onClick={handleViewProfile}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainerCard;
