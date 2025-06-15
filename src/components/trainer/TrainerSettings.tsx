
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Calendar, Globe } from 'lucide-react';

interface TrainerSettingsProps {
  trainerId: string;
}

const TrainerSettings = ({ trainerId }: TrainerSettingsProps) => {
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailReminders: true,
    pushNotifications: false,
    marketingEmails: false
  });
  
  const [availability, setAvailability] = useState({
    timezone: 'UTC',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  });

  const { toast } = useToast();

  const handleSaveNotifications = () => {
    // Here you would typically save to Supabase
    toast({
      title: "Success",
      description: "Notification preferences saved"
    });
  };

  const handleSaveAvailability = () => {
    // Here you would typically save to Supabase
    toast({
      title: "Success", 
      description: "Availability settings saved"
    });
  };

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email notifications for new bookings</p>
              <p className="text-sm text-gray-500">Get notified when students book sessions</p>
            </div>
            <Switch
              checked={notifications.emailBookings}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, emailBookings: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session reminders</p>
              <p className="text-sm text-gray-500">Receive reminders before upcoming sessions</p>
            </div>
            <Switch
              checked={notifications.emailReminders}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, emailReminders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push notifications</p>
              <p className="text-sm text-gray-500">Browser notifications for important updates</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing emails</p>
              <p className="text-sm text-gray-500">Tips and updates about growing your training business</p>
            </div>
            <Switch
              checked={notifications.marketingEmails}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, marketingEmails: checked })
              }
            />
          </div>

          <Button onClick={handleSaveNotifications} className="w-full">
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <Select value={availability.timezone} onValueChange={(value) => 
              setAvailability({ ...availability, timezone: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <Input
                type="time"
                value={availability.workingHours.start}
                onChange={(e) => setAvailability({
                  ...availability,
                  workingHours: { ...availability.workingHours, start: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <Input
                type="time"
                value={availability.workingHours.end}
                onChange={(e) => setAvailability({
                  ...availability,
                  workingHours: { ...availability.workingHours, end: e.target.value }
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {days.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Switch
                    checked={availability.workingDays.includes(day.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAvailability({
                          ...availability,
                          workingDays: [...availability.workingDays, day.value]
                        });
                      } else {
                        setAvailability({
                          ...availability,
                          workingDays: availability.workingDays.filter(d => d !== day.value)
                        });
                      }
                    }}
                  />
                  <label className="text-sm">{day.label}</label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveAvailability} className="w-full">
            Save Availability Settings
          </Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Download My Data
          </Button>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerSettings;
