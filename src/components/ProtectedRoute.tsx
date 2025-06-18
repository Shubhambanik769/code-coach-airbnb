
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

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

      if (userRole === null) {
        console.log('Role still loading, waiting...');
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        console.log('Role mismatch, redirecting based on user role');
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

  if (loading || userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
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
