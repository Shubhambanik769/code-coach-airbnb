import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MFASetup from '@/components/auth/MFASetup';
import MFAChallenge from '@/components/auth/MFAChallenge';
import { useMFA } from '@/hooks/useMFA';

const MFAFlow = () => {
  const { user, userRole, completeMFAChallenge, signOut } = useAuth();
  const { hasMFA } = useMFA();
  const [showSetup, setShowSetup] = useState(false);
  const navigate = useNavigate();

  const handleMFAComplete = () => {
    completeMFAChallenge();
    
    // Navigate to appropriate dashboard based on role
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
  };

  const handleMFACancel = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSkipMFA = () => {
    completeMFAChallenge();
    
    // Navigate to appropriate dashboard
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
  };

  // If user has MFA enabled, show challenge
  if (hasMFA && !showSetup) {
    return (
      <MFAChallenge
        onSuccess={handleMFAComplete}
        onCancel={handleMFACancel}
      />
    );
  }

  // If no MFA, offer setup
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-techblue-50 flex items-center justify-center p-4">
      <MFASetup
        onComplete={handleMFAComplete}
        onSkip={handleSkipMFA}
      />
    </div>
  );
};

export default MFAFlow;