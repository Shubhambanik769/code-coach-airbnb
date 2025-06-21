
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface TrainerEarningsProps {
  trainerId: string;
}

const TrainerEarnings = ({ trainerId }: TrainerEarningsProps) => {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['trainer-earnings', trainerId],
    queryF: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('total_amount, start_time, status')
        .eq('trainer_id', trainerId)
        .eq('status', 'completed');

      if (error) throw error;
      return data;
    },
    enabled: !!trainerId
  });

  const calculateEarnings = () => {
    if (!earnings) return { total: 0, thisMonth: 0, lastMonth: 0, thisWeek: 0 };

    const now = new Date();
    const thisMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    const total = earnings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
    
    const thisMonthEarnings = earnings
      .filter(booking => new Date(booking.start_time) >= thisMonth)
      .reduce((sum, booking) => sum + Number(booking.total_amount), 0);

    const lastMonthEarnings = earnings
      .filter(booking => {
        const date = new Date(booking.start_time);
        return date >= lastMonth && date <= lastMonthEnd;
      })
      .reduce((sum, booking) => sum + Number(booking.total_amount), 0);

    const thisWeekEarnings = earnings
      .filter(booking => new Date(booking.start_time) >= thisWeekStart)
      .reduce((sum, booking) => sum + Number(booking.total_amount), 0);

    return {
      total,
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      thisWeek: thisWeekEarnings
    };
  };

  const earningsData = calculateEarnings();
  const monthlyGrowth = earningsData.lastMonth > 0 
    ? ((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth) * 100 
    : 0;

  const earningCards = [
    {
      title: 'Total Earnings',
      value: `₹${earningsData.total.toFixed(2)}`,
      icon: DollarSign,
      description: 'All time earnings'
    },
    {
      title: 'This Month',
      value: `₹${earningsData.thisMonth.toFixed(2)}`,
      icon: Calendar,
      description: format(new Date(), 'MMMM yyyy')
    },
    {
      title: 'This Week',
      value: `₹${earningsData.thisWeek.toFixed(2)}`,
      icon: CreditCard,
      description: 'Current week'
    },
    {
      title: 'Monthly Growth',
      value: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Compared to last month'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {earningCards.map((card, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <card.icon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Sessions Completed</span>
              <span className="text-lg font-bold">{earnings?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Average per Session</span>
              <span className="text-lg font-bold">
                ₹{earnings?.length ? (earningsData.total / earnings.length).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerEarnings;
