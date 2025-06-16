
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, ThumbsUp } from 'lucide-react';

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
  };
  onSelect?: (trainerId: string) => void;
}

const TrainerCard = ({ trainer, onSelect }: TrainerCardProps) => {
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
    // This would be calculated from feedback data
    // For now, we'll estimate based on rating
    if (!trainer.rating || trainer.rating === 0) return 0;
    return Math.round((trainer.rating / 5) * 100);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {trainer.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{trainer.title}</p>
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {renderStars(trainer.rating || 0)}
                <span className="text-sm font-medium text-gray-700">
                  {trainer.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ({trainer.total_reviews || 0} reviews)
              </span>
            </div>

            {/* Recommendation Rate */}
            {trainer.total_reviews && trainer.total_reviews > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <ThumbsUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  {getRecommendationRate()}% would recommend
                </span>
              </div>
            )}
          </div>
          
          <div className="text-right">
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

        <Button
          onClick={() => onSelect?.(trainer.id)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainerCard;
