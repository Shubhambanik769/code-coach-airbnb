
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
      // If user is not authenticated, redirect to auth page
      if (!user) {
        navigate(redirectTo);
        return;
      }

      // If a specific role is required and user doesn't have it, redirect to appropriate dashboard
      if (requiredRole && userRole !== requiredRole) {
        console.log(`Access denied. Required: ${requiredRole}, User has: ${userRole}`);
        
        // Redirect users to their appropriate dashboard based on their role
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'trainer':
            navigate('/trainer-dashboard');
            break;
          case 'user':
          default:
            navigate('/dashboard');
            break;
        }
        return;
      }
    }
  }, [user, userRole, loading, navigate, requiredRole, redirectTo]);

  // Show loading spinner while checking authentication
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

  // If user is not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If specific role is required and user doesn't have it, don't render anything (redirect will happen)
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
