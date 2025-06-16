
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, User } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface ChatListProps {
  userRole?: 'user' | 'trainer';
}

interface BookingWithChat {
  id: string;
  training_topic: string;
  start_time: string;
  status: string;
  student_id: string;
  trainer_id: string;
  student_profile?: {
    full_name: string | null;
    email: string;
  } | null;
  trainer_profile?: {
    full_name: string | null;
    email: string;
  } | null;
  unread_count?: number;
  last_message?: {
    content: string;
    created_at: string;
  } | null;
}

const ChatList = ({ userRole }: ChatListProps) => {
  const [selectedChat, setSelectedChat] = useState<{
    bookingId: string;
    receiverId: string;
    receiverName: string;
  } | null>(null);
  const { user } = useAuth();

  const { data: bookingsWithChat, isLoading } = useQuery({
    queryKey: ['bookings-with-chat', user?.id],
    queryFn: async (): Promise<BookingWithChat[]> => {
      if (!user) return [];

      // Get bookings where user is either student or trainer
      let query = supabase
        .from('bookings')
        .select(`
          id,
          training_topic,
          start_time,
          status,
          student_id,
          trainer_id
        `);

      if (userRole === 'trainer') {
        // For trainers, get their trainer ID first
        const { data: trainerData } = await supabase
          .from('trainers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (trainerData) {
          query = query.eq('trainer_id', trainerData.id);
        }
      } else {
        query = query.eq('student_id', user.id);
      }

      const { data: bookings, error } = await query
        .in('status', ['confirmed', 'assigned', 'delivering', 'delivered', 'completed'])
        .order('start_time', { ascending: false });

      if (error) throw error;

      if (!bookings || bookings.length === 0) return [];

      // Get student profiles
      const studentIds = [...new Set(bookings.map(b => b.student_id))];
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      // Get trainer profiles
      const trainerIds = [...new Set(bookings.map(b => b.trainer_id))];
      const { data: trainerData } = await supabase
        .from('trainers')
        .select('id, user_id')
        .in('id', trainerIds);

      const trainerUserIds = trainerData?.map(t => t.user_id) || [];
      const { data: trainerProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', trainerUserIds);

      // Get unread message counts and last messages for each booking
      const bookingIds = bookings.map(b => b.id);
      const { data: messages } = await supabase
        .from('messages')
        .select('booking_id, content, created_at, is_read, receiver_id')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false });

      // Calculate unread counts and get last messages
      const messageStats = bookingIds.map(bookingId => {
        const bookingMessages = messages?.filter(m => m.booking_id === bookingId) || [];
        const unreadCount = bookingMessages.filter(m => 
          m.receiver_id === user.id && !m.is_read
        ).length;
        const lastMessage = bookingMessages[0];

        return {
          booking_id: bookingId,
          unread_count: unreadCount,
          last_message: lastMessage ? {
            content: lastMessage.content,
            created_at: lastMessage.created_at
          } : null
        };
      });

      // Combine all data
      return bookings.map(booking => {
        const studentProfile = studentProfiles?.find(p => p.id === booking.student_id);
        const trainerData = trainerData?.find(t => t.id === booking.trainer_id);
        const trainerProfile = trainerProfiles?.find(p => p.id === trainerData?.user_id);
        const stats = messageStats.find(s => s.booking_id === booking.id);

        return {
          ...booking,
          student_profile: studentProfile || null,
          trainer_profile: trainerProfile || null,
          unread_count: stats?.unread_count || 0,
          last_message: stats?.last_message || null
        };
      });
    },
    enabled: !!user
  });

  const getChatPartner = (booking: BookingWithChat) => {
    if (userRole === 'trainer') {
      return {
        id: booking.student_id,
        name: booking.student_profile?.full_name || booking.student_profile?.email || 'Student'
      };
    } else {
      // For users, get the trainer's user_id
      const trainerData = bookingsWithChat?.find(b => b.id === booking.id);
      return {
        id: booking.trainer_id, // This will need to be the trainer's user_id for messaging
        name: booking.trainer_profile?.full_name || booking.trainer_profile?.email || 'Trainer'
      };
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (selectedChat) {
    return (
      <ChatWindow
        bookingId={selectedChat.bookingId}
        receiverId={selectedChat.receiverId}
        receiverName={selectedChat.receiverName}
        onClose={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading conversations...
          </div>
        ) : bookingsWithChat?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm">Messages will appear here after booking confirmations</p>
          </div>
        ) : (
          bookingsWithChat?.map((booking) => {
            const partner = getChatPartner(booking);
            
            return (
              <div
                key={booking.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedChat({
                  bookingId: booking.id,
                  receiverId: partner.id,
                  receiverName: partner.name
                })}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{partner.name}</span>
                    {booking.unread_count && booking.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {booking.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {booking.last_message ? 
                      formatLastMessageTime(booking.last_message.created_at) :
                      formatLastMessageTime(booking.start_time)
                    }
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {booking.training_topic}
                </p>
                
                {booking.last_message ? (
                  <p className="text-sm text-gray-500 truncate">
                    {booking.last_message.content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No messages yet
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;
