
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TrainerOnboardingStatus from '@/components/trainer/TrainerOnboardingStatus';

const TrainerDashboard = () => {
  const { user } = useAuth();

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

  // Show onboarding status for all cases (no application, pending, approved, rejected)
  return <TrainerOnboardingStatus />;
};

export default TrainerDashboard;
