
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface TrainingRequest {
  id: string;
  title: string;
  description: string;
  target_audience: string;
  expected_start_date: string;
  duration_hours: number;
  delivery_mode: string;
  tools_required: string[];
  budget_min: number;
  budget_max: number;
  application_deadline: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface PublicTrainingRequestCardProps {
  request: TrainingRequest;
  onViewDetails: (requestId: string) => void;
  isAuthenticated: boolean;
}

const PublicTrainingRequestCard = ({ 
  request, 
  onViewDetails, 
  isAuthenticated 
}: PublicTrainingRequestCardProps) => {
  return (
    <Card className="border-l-4 border-l-techblue-500 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
              <Badge variant="secondary" className="bg-techblue-100 text-techblue-700">
                {request.target_audience}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{request.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              Posted by: <span className="font-medium">{request.profiles?.full_name || 'Anonymous'}</span>
            </div>
          </div>
          <Button 
            onClick={() => onViewDetails(request.id)}
            className="ml-4 bg-techblue-600 hover:bg-techblue-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isAuthenticated ? 'View & Apply' : 'Login to Apply'}
          </Button>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{request.delivery_mode}</span>
          </div>
          {request.duration_hours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{request.duration_hours} hours</span>
            </div>
          )}
          {(request.budget_min > 0 || request.budget_max > 0) && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">
                ${request.budget_min}-${request.budget_max}
              </span>
            </div>
          )}
        </div>

        {/* Tools/Skills Required */}
        {request.tools_required && request.tools_required.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Skills/Tools Required:</p>
            <div className="flex flex-wrap gap-2">
              {request.tools_required.slice(0, 5).map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {request.tools_required.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{request.tools_required.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 pt-4 border-t">
          <div className="flex items-center gap-4 mb-2 sm:mb-0">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Posted: {format(new Date(request.created_at), 'MMM dd, yyyy')}
            </span>
            {request.expected_start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Starts: {format(new Date(request.expected_start_date), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
          {request.application_deadline && (
            <div className="text-orange-600 font-medium">
              Apply by: {format(new Date(request.application_deadline), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicTrainingRequestCard;
