
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, DollarSign, Calendar, Receipt } from 'lucide-react';

const UserBilling = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-billing', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trainers (
            name,
            title,
            profiles (
              full_name
            )
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSpent = bookings?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {booking.training_topic}
                      </h3>
                      <p className="text-sm text-gray-600">
                        with {booking.trainers?.profiles?.full_name || booking.trainers?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${Number(booking.total_amount).toFixed(2)}
                      </p>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {new Date(booking.start_time).toLocaleDateString()} at{' '}
                      {new Date(booking.start_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span>{booking.duration_hours} hours</span>
                    {booking.organization_name && (
                      <span>for {booking.organization_name}</span>
                    )}
                  </div>
                  
                  {booking.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Notes: {booking.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No billing history found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBilling;
