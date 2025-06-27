
export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled' 
  | 'booking_completed'
  | 'training_request_created'
  | 'training_application_received'
  | 'training_application_accepted'
  | 'training_application_rejected'
  | 'trainer_approved'
  | 'trainer_rejected'
  | 'payment_received'
  | 'review_received'
  | 'system_announcement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}
