
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, DollarSign } from 'lucide-react';

interface TrainerWithStats {
  id: string;
  user_id: string;
  title: string;
  specialization: string;
  profile?: {
    id: string;
    full_name: string;
    email: string;
  };
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  recentBookings: number;
  bookingGrowth: number;
}

interface TopTrainersData {
  topByEarnings: TrainerWithStats[];
  topByRating: TrainerWithStats[];
  topByBookings: TrainerWithStats[];
  fastestGrowing: TrainerWithStats[];
}

const TopTrainersAnalytics = () => {
  const { data: topTrainers, isLoading } = useQuery<TopTrainersData>({
    queryKey: ['top-trainers-analytics'],
    queryFn: async () => {
      // Get all trainers with their profiles
      const { data: trainers } = await supabase
        .from('trainers')
        .select('*')
        .eq('status', 'approved');

      if (!trainers) return {
        topByEarnings: [],
        topByRating: [],
        topByBookings: [],
        fastestGrowing: []
      };

      // Get user profiles
      const userIds = trainers.map(t => t.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Get bookings data for each trainer
      const trainerIds = trainers.map(t => t.id);
      const { data: bookings } = await supabase
        .from('bookings')
        .select('trainer_id, total_amount, status, created_at')
        .in('trainer_id', trainerIds);

      // Get reviews data
      const { data: reviews } = await supabase
        .from('reviews')
        .select('trainer_id, rating')
        .in('trainer_id', trainerIds);

      // Process data for each trainer
      const trainersWithStats: TrainerWithStats[] = trainers.map(trainer => {
        const profile = profiles?.find(p => p.id === trainer.user_id);
        const trainerBookings = bookings?.filter(b => b.trainer_id === trainer.id) || [];
        const trainerReviews = reviews?.filter(r => r.trainer_id === trainer.id) || [];
        
        const totalBookings = trainerBookings.length;
        const completedBookings = trainerBookings.filter(b => b.status === 'completed').length;
        const totalEarnings = trainerBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);
        
        const averageRating = trainerReviews.length > 0 
          ? trainerReviews.reduce((sum, r) => sum + r.rating, 0) / trainerReviews.length 
          : 0;

        // Calculate monthly growth (last 30 days vs previous 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentBookings = trainerBookings.filter(b => 
          new Date(b.created_at) >= thirtyDaysAgo
        ).length;
        const previousBookings = trainerBookings.filter(b => 
          new Date(b.created_at) >= sixtyDaysAgo && new Date(b.created_at) < thirtyDaysAgo
        ).length;

        const bookingGrowth = previousBookings > 0 
          ? ((recentBookings - previousBookings) / previousBookings) * 100 
          : recentBookings > 0 ? 100 : 0;

        return {
          ...trainer,
          profile,
          totalBookings,
          completedBookings,
          totalEarnings,
          averageRating,
          totalReviews: trainerReviews.length,
          completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
          recentBookings,
          bookingGrowth
        };
      });

      // Sort by different criteria
      return {
        topByEarnings: [...trainersWithStats].sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 10),
        topByRating: [...trainersWithStats].filter(t => t.totalReviews >= 3).sort((a, b) => b.averageRating - a.averageRating).slice(0, 10),
        topByBookings: [...trainersWithStats].sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 10),
        fastestGrowing: [...trainersWithStats].filter(t => t.totalBookings >= 5).sort((a, b) => b.bookingGrowth - a.bookingGrowth).slice(0, 10)
      };
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const renderTrainerTable = (trainers: TrainerWithStats[], title: string, sortBy: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {sortBy === 'earnings' && <DollarSign className="h-5 w-5" />}
          {sortBy === 'rating' && <Star className="h-5 w-5" />}
          {sortBy === 'growth' && <TrendingUp className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trainer</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Earnings</TableHead>
              {sortBy === 'growth' && <TableHead>Growth</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((trainer, index) => (
              <TableRow key={trainer.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{trainer.profile?.full_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{trainer.title}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{trainer.specialization || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{trainer.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({trainer.totalReviews})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{trainer.totalBookings} total</div>
                    <div className="text-sm text-gray-500">{trainer.completionRate.toFixed(0)}% completion</div>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(trainer.totalEarnings)}</TableCell>
                {sortBy === 'growth' && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-4 w-4 ${trainer.bookingGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={trainer.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {trainer.bookingGrowth >= 0 ? '+' : ''}{trainer.bookingGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTrainerTable(topTrainers?.topByEarnings || [], "Top Earners", "earnings")}
        {renderTrainerTable(topTrainers?.topByRating || [], "Highest Rated", "rating")}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTrainerTable(topTrainers?.topByBookings || [], "Most Active", "bookings")}
        {renderTrainerTable(topTrainers?.fastestGrowing || [], "Fastest Growing", "growth")}
      </div>
    </div>
  );
};

export default TopTrainersAnalytics;
