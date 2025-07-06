
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface TrainerEarningsProps {
  trainerId: string;
}

interface BookingData {
  total_amount: number;
  start_time: string;
  status: string;
  platform_commission_rate: number;
  platform_commission_amount: number;
  trainer_payout_amount: number;
  bmc_payment_status: string;
}

interface PayoutData {
  id: string;
  gross_amount: number;
  platform_commission: number;
  net_amount: number;
  payout_status: string;
  created_at: string;
  paid_at: string | null;
}

const TrainerEarnings = ({ trainerId }: TrainerEarningsProps) => {
  // Fetch completed bookings with BMC payment info
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['trainer-earnings', trainerId],
    queryFn: async (): Promise<BookingData[]> => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          total_amount, 
          start_time, 
          status, 
          platform_commission_rate,
          platform_commission_amount,
          trainer_payout_amount,
          bmc_payment_status
        `)
        .eq('trainer_id', trainerId)
        .eq('status', 'completed');

      if (error) throw error;
      return data || [];
    },
    enabled: !!trainerId
  });

  // Fetch trainer payouts for detailed breakdown
  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ['trainer-payouts', trainerId],
    queryFn: async (): Promise<PayoutData[]> => {
      const { data, error } = await supabase
        .from('trainer_payouts')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!trainerId
  });

  const isLoading = earningsLoading || payoutsLoading;

  const calculateEarnings = () => {
    if (!earnings || !Array.isArray(earnings)) return { 
      grossTotal: 0, 
      netTotal: 0, 
      commissionTotal: 0, 
      thisMonth: 0, 
      lastMonth: 0, 
      thisWeek: 0 
    };

    const now = new Date();
    const thisMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    // Calculate gross (total client payments) and net (trainer receives)
    const grossTotal = earnings.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0);
    const netTotal = earnings.reduce((sum, booking) => sum + Number(booking.trainer_payout_amount || booking.total_amount * 0.8), 0);
    const commissionTotal = grossTotal - netTotal;
    
    const thisMonthNet = earnings
      .filter(booking => new Date(booking.start_time) >= thisMonth)
      .reduce((sum, booking) => sum + Number(booking.trainer_payout_amount || booking.total_amount * 0.8), 0);

    const lastMonthNet = earnings
      .filter(booking => {
        const date = new Date(booking.start_time);
        return date >= lastMonth && date <= lastMonthEnd;
      })
      .reduce((sum, booking) => sum + Number(booking.trainer_payout_amount || booking.total_amount * 0.8), 0);

    const thisWeekNet = earnings
      .filter(booking => new Date(booking.start_time) >= thisWeekStart)
      .reduce((sum, booking) => sum + Number(booking.trainer_payout_amount || booking.total_amount * 0.8), 0);

    return {
      grossTotal,
      netTotal,
      commissionTotal,
      thisMonth: thisMonthNet,
      lastMonth: lastMonthNet,
      thisWeek: thisWeekNet
    };
  };

  const calculatePayoutStats = () => {
    if (!payouts || !Array.isArray(payouts)) return {
      pendingAmount: 0,
      paidAmount: 0,
      pendingCount: 0,
      paidCount: 0
    };

    const pending = payouts.filter(p => p.payout_status === 'pending');
    const paid = payouts.filter(p => p.payout_status === 'paid');

    return {
      pendingAmount: pending.reduce((sum, p) => sum + Number(p.net_amount), 0),
      paidAmount: paid.reduce((sum, p) => sum + Number(p.net_amount), 0),
      pendingCount: pending.length,
      paidCount: paid.length
    };
  };

  const earningsData = calculateEarnings();
  const payoutStats = calculatePayoutStats();
  const monthlyGrowth = earningsData.lastMonth > 0 
    ? ((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth) * 100 
    : 0;

  const earningCards = [
    {
      title: 'Net Earnings (Your Share)',
      value: `₹${earningsData.netTotal.toFixed(2)}`,
      icon: DollarSign,
      description: 'After platform commission',
      color: 'text-green-600'
    },
    {
      title: 'Pending Payouts',
      value: `₹${payoutStats.pendingAmount.toFixed(2)}`,
      icon: Calendar,
      description: `${payoutStats.pendingCount} sessions awaiting payout`,
      color: 'text-orange-600'
    },
    {
      title: 'This Month Net',
      value: `₹${earningsData.thisMonth.toFixed(2)}`,
      icon: CreditCard,
      description: format(new Date(), 'MMMM yyyy'),
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Growth',
      value: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Compared to last month',
      color: monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
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
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-medium">Gross Revenue (Client Payments)</span>
              <span className="text-lg font-bold text-green-700">₹{earningsData.grossTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <span className="font-medium">Platform Commission</span>
              <span className="text-lg font-bold text-orange-700">-₹{earningsData.commissionTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="font-medium">Your Net Earnings</span>
              <span className="text-lg font-bold text-blue-700">₹{earningsData.netTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Average Net per Session</span>
              <span className="text-lg font-bold">
                ₹{earnings && earnings.length > 0 ? (earningsData.netTotal / earnings.length).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerEarnings;
