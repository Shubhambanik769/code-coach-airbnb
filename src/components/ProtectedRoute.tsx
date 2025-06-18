
import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
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

      if (requiredRole && userRole && userRole !== requiredRole) {
        console.log(`Role mismatch - has: ${userRole}, needs: ${requiredRole}`);
        // Redirect based on actual user role
        const dashboardMap: Record<string, string> = {
          'admin': '/admin',
          'trainer': '/trainer-dashboard',
          'user': '/dashboard'
        };
        const redirectPath = dashboardMap[userRole] || '/dashboard';
        navigate(redirectPath);
      }
    }
  }, [user, userRole, loading, navigate, requiredRole, redirectTo]);

  if (loading) {
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
