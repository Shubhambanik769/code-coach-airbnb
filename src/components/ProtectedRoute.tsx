
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
      console.log('ProtectedRoute check - User:', user?.email, 'Role:', userRole, 'Required:', requiredRole);
      
      if (!user) {
        console.log('No user, redirecting to auth');
        navigate(redirectTo);
        return;
      }

      // Wait for role to be loaded before making redirection decisions
      if (userRole === null) {
        console.log('Role still loading, waiting...');
        return;
      }

      // Special handling for trainer role
      if (requiredRole === 'trainer' && userRole === 'trainer') {
        // Let the TrainerDashboard component handle the trainer status check
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        console.log('Role mismatch, redirecting based on user role');
        // Redirect based on user role
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'trainer':
            navigate('/trainer-dashboard');
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

  // Don't render if role is still loading
  if (userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
