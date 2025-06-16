
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import TrainerOnboardingStatus from '@/components/trainer/TrainerOnboardingStatus';
import TrainerCalendar from '@/components/trainer/TrainerCalendar';
import TrainerPricing from '@/components/trainer/TrainerPricing';
import TrainerBookingManagement from '@/components/trainer/TrainerBookingManagement';
import TrainerSchedule from '@/components/trainer/TrainerSchedule';
import TrainerEarnings from '@/components/trainer/TrainerEarnings';
import { Calendar, DollarSign, BookOpen, BarChart3, Clock, Settings } from 'lucide-react';

const TrainerDashboard = () => {
  const { user, signOut } = useAuth();

  const { data: trainerProfile, isLoading } = useQuery({
    queryKey: ['trainer-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trainer dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding status if not approved
  if (!trainerProfile || trainerProfile.status !== 'approved') {
    return <TrainerOnboardingStatus />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {trainerProfile.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <TrainerCalendar trainerId={trainerProfile.id} />
          </TabsContent>

          <TabsContent value="pricing">
            <TrainerPricing trainerId={trainerProfile.id} />
          </TabsContent>

          <TabsContent value="bookings">
            <TrainerBookingManagement trainerId={trainerProfile.id} />
          </TabsContent>

          <TabsContent value="schedule">
            <TrainerSchedule trainerId={trainerProfile.id} />
          </TabsContent>

          <TabsContent value="earnings">
            <TrainerEarnings trainerId={trainerProfile.id} />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-8">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TrainerDashboard;
