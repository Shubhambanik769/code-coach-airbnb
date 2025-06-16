
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, DollarSign, Percent, Shield } from 'lucide-react';

const GlobalSettings = () => {
  const [settings, setSettings] = useState({
    platform_commission: 10,
    gst_rate: 18,
    manual_pricing_override: false,
    minimum_booking_amount: 500,
    maximum_booking_hours: 8,
    cancellation_fee: 5
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current platform settings
  const { data: platformSettings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert array to object
      const settingsObj: any = {};
      data?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      return settingsObj;
    }
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (platformSettings) {
      setSettings(prev => ({
        ...prev,
        ...platformSettings
      }));
    }
  }, [platformSettings]);

  // Update platform settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const settingsToUpdate = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'boolean' ? (value ? 1 : 0) : value,
        description: getSettingDescription(key)
      }));

      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert(setting, {
            onConflict: 'setting_key'
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({
        title: "Settings Updated",
        description: "Global platform settings have been updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update platform settings",
        variant: "destructive"
      });
    }
  });

  const getSettingDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      platform_commission: "Platform commission percentage charged on each booking",
      gst_rate: "GST rate applied to bookings",
      manual_pricing_override: "Allow admin to override trainer pricing",
      minimum_booking_amount: "Minimum amount required for a booking",
      maximum_booking_hours: "Maximum hours allowed per booking",
      cancellation_fee: "Cancellation fee percentage"
    };
    return descriptions[key] || "";
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="financial" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="booking">Booking Rules</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Control</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Commission Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform_commission">Platform Commission (%)</Label>
                      <Input
                        id="platform_commission"
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        value={settings.platform_commission}
                        onChange={(e) => handleSettingChange('platform_commission', parseFloat(e.target.value))}
                      />
                      <p className="text-sm text-gray-600">Percentage commission charged on each booking</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gst_rate">GST Rate (%)</Label>
                      <Input
                        id="gst_rate"
                        type="number"
                        min="0"
                        max="30"
                        step="0.1"
                        value={settings.gst_rate}
                        onChange={(e) => handleSettingChange('gst_rate', parseFloat(e.target.value))}
                      />
                      <p className="text-sm text-gray-600">GST rate applied to all transactions</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fee Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cancellation_fee">Cancellation Fee (%)</Label>
                      <Input
                        id="cancellation_fee"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={settings.cancellation_fee}
                        onChange={(e) => handleSettingChange('cancellation_fee', parseFloat(e.target.value))}
                      />
                      <p className="text-sm text-gray-600">Percentage fee for booking cancellations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="booking" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimum_booking_amount">Minimum Booking Amount (₹)</Label>
                    <Input
                      id="minimum_booking_amount"
                      type="number"
                      min="0"
                      value={settings.minimum_booking_amount}
                      onChange={(e) => handleSettingChange('minimum_booking_amount', parseFloat(e.target.value))}
                    />
                    <p className="text-sm text-gray-600">Minimum amount required for any booking</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximum_booking_hours">Maximum Booking Hours</Label>
                    <Input
                      id="maximum_booking_hours"
                      type="number"
                      min="1"
                      max="24"
                      value={settings.maximum_booking_hours}
                      onChange={(e) => handleSettingChange('maximum_booking_hours', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-gray-600">Maximum hours allowed per single booking</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Pricing Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Manual Pricing Override</Label>
                      <p className="text-sm text-gray-600">Allow admins to manually override trainer pricing</p>
                    </div>
                    <Switch
                      checked={settings.manual_pricing_override}
                      onCheckedChange={(checked) => handleSettingChange('manual_pricing_override', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalSettings;
