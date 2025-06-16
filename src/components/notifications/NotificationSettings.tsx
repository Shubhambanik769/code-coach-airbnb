
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageCircle, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPreferences {
  email_bookings: boolean;
  email_messages: boolean;
  email_reminders: boolean;
  whatsapp_bookings: boolean;
  whatsapp_reminders: boolean;
  push_notifications: boolean;
  whatsapp_number?: string;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_bookings: true,
    email_messages: true,
    email_reminders: true,
    whatsapp_bookings: false,
    whatsapp_reminders: false,
    push_notifications: true,
    whatsapp_number: ''
  });

  // Fetch user notification preferences
  const { data: userPreferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences, phone')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return null;
      }

      if (data?.notification_preferences) {
        const prefs = data.notification_preferences as NotificationPreferences;
        setPreferences({
          ...prefs,
          whatsapp_number: data.phone || ''
        });
        return prefs;
      }
      return null;
    },
    enabled: !!user?.id
  });

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: NotificationPreferences) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: newPreferences,
          phone: newPreferences.whatsapp_number
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      });
    }
  });

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-5 w-5" />
            <h3 className="text-lg font-medium">Email Notifications</h3>
          </div>
          
          <div className="space-y-3 pl-7">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_bookings">New Bookings</Label>
                <p className="text-sm text-gray-500">Get notified when you receive new booking requests</p>
              </div>
              <Switch
                id="email_bookings"
                checked={preferences.email_bookings}
                onCheckedChange={(checked) => handlePreferenceChange('email_bookings', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_messages">New Messages</Label>
                <p className="text-sm text-gray-500">Get notified when you receive new chat messages</p>
              </div>
              <Switch
                id="email_messages"
                checked={preferences.email_messages}
                onCheckedChange={(checked) => handlePreferenceChange('email_messages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_reminders">Session Reminders</Label>
                <p className="text-sm text-gray-500">Get reminder emails before scheduled sessions</p>
              </div>
              <Switch
                id="email_reminders"
                checked={preferences.email_reminders}
                onCheckedChange={(checked) => handlePreferenceChange('email_reminders', checked)}
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5" />
            <h3 className="text-lg font-medium">WhatsApp Notifications</h3>
          </div>

          <div className="space-y-3 pl-7">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                placeholder="+91 98765 43210"
                value={preferences.whatsapp_number}
                onChange={(e) => handlePreferenceChange('whatsapp_number', e.target.value)}
              />
              <p className="text-sm text-gray-500">Include country code (e.g., +91 for India)</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whatsapp_bookings">Booking Updates</Label>
                <p className="text-sm text-gray-500">Get WhatsApp notifications for booking confirmations and updates</p>
              </div>
              <Switch
                id="whatsapp_bookings"
                checked={preferences.whatsapp_bookings}
                onCheckedChange={(checked) => handlePreferenceChange('whatsapp_bookings', checked)}
                disabled={!preferences.whatsapp_number}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whatsapp_reminders">Session Reminders</Label>
                <p className="text-sm text-gray-500">Get WhatsApp reminders before scheduled sessions</p>
              </div>
              <Switch
                id="whatsapp_reminders"
                checked={preferences.whatsapp_reminders}
                onCheckedChange={(checked) => handlePreferenceChange('whatsapp_reminders', checked)}
                disabled={!preferences.whatsapp_number}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-5 w-5" />
            <h3 className="text-lg font-medium">Push Notifications</h3>
          </div>

          <div className="space-y-3 pl-7">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push_notifications">Browser Notifications</Label>
                <p className="text-sm text-gray-500">Get instant notifications in your browser</p>
              </div>
              <Switch
                id="push_notifications"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => handlePreferenceChange('push_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={updatePreferencesMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
