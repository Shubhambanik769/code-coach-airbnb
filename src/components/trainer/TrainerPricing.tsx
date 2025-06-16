
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Info } from 'lucide-react';

interface TrainerPricingProps {
  trainerId: string;
}

const TrainerPricing = ({ trainerId }: TrainerPricingProps) => {
  const [pricingType, setPricingType] = useState<'hourly' | 'session'>('hourly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [sessionRate, setSessionRate] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pricing } = useQuery({
    queryKey: ['trainer-pricing', trainerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_pricing')
        .select('*')
        .eq('trainer_id', trainerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!trainerId
  });

  const { data: platformSettings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (pricing) {
      setPricingType(pricing.pricing_type as 'hourly' | 'session');
      setHourlyRate(pricing.hourly_rate?.toString() || '');
      setSessionRate(pricing.session_rate?.toString() || '');
    }
  }, [pricing]);

  const savePricingMutation = useMutation({
    mutationFn: async (pricingData: any) => {
      if (pricing) {
        const { error } = await supabase
          .from('trainer_pricing')
          .update(pricingData)
          .eq('trainer_id', trainerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trainer_pricing')
          .insert({
            trainer_id: trainerId,
            ...pricingData
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-pricing'] });
      toast({
        title: "Success",
        description: "Pricing updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    const data = {
      pricing_type: pricingType,
      hourly_rate: parseFloat(hourlyRate) || 0,
      session_rate: pricingType === 'session' ? parseFloat(sessionRate) : null
    };

    if (data.hourly_rate <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid hourly rate",
        variant: "destructive"
      });
      return;
    }

    if (pricingType === 'session' && (!sessionRate || parseFloat(sessionRate) <= 0)) {
      toast({
        title: "Error",
        description: "Please enter a valid session rate",
        variant: "destructive"
      });
      return;
    }

    savePricingMutation.mutate(data);
  };

  const commissionRate = platformSettings?.find(s => s.setting_key === 'commission_rate')?.setting_value || 0.15;
  const gstRate = platformSettings?.find(s => s.setting_key === 'gst_rate')?.setting_value || 0.18;
  const platformFee = platformSettings?.find(s => s.setting_key === 'platform_fee')?.setting_value || 50;

  const calculateFinalAmount = (baseRate: number) => {
    const commission = baseRate * commissionRate;
    const gst = baseRate * gstRate;
    const total = baseRate + commission + gst + platformFee;
    return {
      baseRate,
      commission,
      gst,
      platformFee,
      total
    };
  };

  const hourlyCalculation = hourlyRate ? calculateFinalAmount(parseFloat(hourlyRate)) : null;
  const sessionCalculation = sessionRate ? calculateFinalAmount(parseFloat(sessionRate)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="pricing-type">Pricing Type</Label>
            <Select value={pricingType} onValueChange={(value) => setPricingType(value as 'hourly' | 'session')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="session">Session Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hourly-rate">Hourly Rate (₹)</Label>
            <Input
              id="hourly-rate"
              type="number"
              placeholder="Enter hourly rate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>

          {pricingType === 'session' && (
            <div>
              <Label htmlFor="session-rate">Session Rate (₹)</Label>
              <Input
                id="session-rate"
                type="number"
                placeholder="Enter session rate"
                value={sessionRate}
                onChange={(e) => setSessionRate(e.target.value)}
              />
            </div>
          )}

          <Button 
            onClick={handleSave}
            disabled={savePricingMutation.isPending}
            className="w-full"
          >
            Save Pricing
          </Button>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Pricing Breakdown</span>
          </div>

          {hourlyCalculation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Hourly Rate Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Your Rate:</span>
                  <span>₹{hourlyCalculation.baseRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission ({(commissionRate * 100).toFixed(1)}%):</span>
                  <span>₹{hourlyCalculation.commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({(gstRate * 100).toFixed(1)}%):</span>
                  <span>₹{hourlyCalculation.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span>₹{hourlyCalculation.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total Client Pays:</span>
                  <span>₹{hourlyCalculation.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {pricingType === 'session' && sessionCalculation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Session Rate Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Your Rate:</span>
                  <span>₹{sessionCalculation.baseRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission ({(commissionRate * 100).toFixed(1)}%):</span>
                  <span>₹{sessionCalculation.commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({(gstRate * 100).toFixed(1)}%):</span>
                  <span>₹{sessionCalculation.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span>₹{sessionCalculation.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total Client Pays:</span>
                  <span>₹{sessionCalculation.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainerPricing;
