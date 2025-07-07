import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useMFA = () => {
  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);
  const { toast } = useToast();

  // Check if user has MFA enabled
  const checkMFAStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error('Error checking MFA status:', error);
        return;
      }

      const verifiedFactors = data.totp.filter(factor => factor.status === 'verified');
      setMfaFactors(verifiedFactors);
      setHasMFA(verifiedFactors.length > 0);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Disable MFA
  const disableMFA = async (factorId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      
      if (error) throw error;

      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled for your account."
      });
      
      await checkMFAStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Check MFA requirement after sign in
  const checkMFARequired = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (error) {
        console.error('Error checking MFA requirement:', error);
        return null;
      }

      return {
        currentLevel: data.currentLevel,
        nextLevel: data.nextLevel,
        requiresMFA: data.nextLevel === 'aal2' && data.currentLevel === 'aal1'
      };
    } catch (error) {
      console.error('Error checking MFA requirement:', error);
      return null;
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await checkMFAStatus();
        } else {
          setMfaFactors([]);
          setHasMFA(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    mfaFactors,
    hasMFA,
    loading,
    checkMFAStatus,
    disableMFA,
    checkMFARequired
  };
};