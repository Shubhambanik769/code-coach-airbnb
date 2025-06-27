
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  FileText, 
  UserCheck, 
  UserX, 
  DollarSign, 
  Star, 
  Bell,
  MarkAsReadIcon
} from 'lucide-react';
import type { NotificationType } from '@/types/notifications';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'booking_confirmed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'booking_cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'booking_completed':
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case 'training_request_created':
    case 'training_application_received':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'training_application_accepted':
    case 'trainer_approved':
      return <UserCheck className="h-4 w-4 text-green-500" />;
    case 'training_application_rejected':
    case 'trainer_rejected':
      return <UserX className="h-4 w-4 text-red-500" />;
    case 'payment_received':
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case 'review_received':
      return <Star className="h-4 w-4 text-yellow-500" />;
    case 'system_announcement':
      return <Bell className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'booking_confirmed':
    case 'training_application_accepted':
    case 'trainer_approved':
    case 'payment_received':
      return 'bg-green-50 border-green-200';
    case 'booking_cancelled':
    case 'training_application_rejected':
    case 'trainer_rejected':
      return 'bg-red-50 border-red-200';
    case 'booking_completed':
    case 'training_request_created':
    case 'training_application_received':
      return 'bg-blue-50 border-blue-200';
    case 'review_received':
      return 'bg-yellow-50 border-yellow-200';
    case 'system_announcement':
      return 'bg-purple-50 border-purple-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const NotificationList = () => {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead([notificationId]);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400">You'll see notifications here when you have new updates</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {format(new Date(notification.created_at), 'MMM dd, yyyy at HH:mm')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <>
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View All Notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationList;
