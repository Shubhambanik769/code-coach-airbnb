
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(redirectTo);
        return;
      }

      // Special handling for trainer role
      if (requiredRole === 'trainer' && userRole === 'trainer') {
        // Let the TrainerDashboard component handle the trainer status check
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        // Redirect based on user role
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'trainer':
            navigate('/trainer');
            break;
          default:
            navigate('/dashboard');
            break;
        }
      }
    }
  }, [user, userRole, loading, navigate, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
