
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type: string;
  booking_id: string;
  sender_profile?: {
    full_name: string | null;
    email: string;
  } | null;
  receiver_profile?: {
    full_name: string | null;
    email: string;
  } | null;
  booking?: {
    training_topic: string;
    status: string;
  } | null;
}

const ChatAudit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-chat-audit', searchTerm, statusFilter],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          message_type,
          booking_id,
          sender_id,
          receiver_id
        `)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) return [];

      // Get sender and receiver profiles
      const userIds = [...new Set([
        ...messagesData.map(m => m.sender_id),
        ...messagesData.map(m => m.receiver_id)
      ])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Get booking data
      const bookingIds = [...new Set(messagesData.map(m => m.booking_id).filter(Boolean))];
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, training_topic, status')
        .in('id', bookingIds);

      // Combine data
      const enrichedMessages: ChatMessage[] = messagesData.map(message => {
        const senderProfile = profilesData?.find(p => p.id === message.sender_id);
        const receiverProfile = profilesData?.find(p => p.id === message.receiver_id);
        const booking = bookingsData?.find(b => b.id === message.booking_id);

        return {
          ...message,
          sender_profile: senderProfile || null,
          receiver_profile: receiverProfile || null,
          booking: booking || null
        };
      });

      // Apply search filter
      let filteredData = enrichedMessages;
      if (searchTerm) {
        filteredData = enrichedMessages.filter(msg => 
          msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.sender_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.receiver_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.sender_profile?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.receiver_profile?.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(msg => msg.booking?.status === statusFilter);
      }

      return filteredData;
    }
  });

  const { data: bookingMessages } = useQuery({
    queryKey: ['booking-messages', selectedBookingId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!selectedBookingId) return [];

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          message_type,
          booking_id,
          sender_id,
          receiver_id
        `)
        .eq('booking_id', selectedBookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!messagesData || messagesData.length === 0) return [];

      // Get sender and receiver profiles
      const userIds = [...new Set([
        ...messagesData.map(m => m.sender_id),
        ...messagesData.map(m => m.receiver_id)
      ])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Get booking data
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, training_topic, status')
        .eq('id', selectedBookingId)
        .single();

      // Combine data
      return messagesData.map(message => ({
        ...message,
        sender_profile: profilesData?.find(p => p.id === message.sender_id) || null,
        receiver_profile: profilesData?.find(p => p.id === message.receiver_id) || null,
        booking: bookingData || null
      }));
    },
    enabled: !!selectedBookingId
  });

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedBookingId && bookingMessages) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversation Details
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setSelectedBookingId(null)}
            >
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {bookingMessages.map((message) => (
              <div key={message.id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {message.sender_profile?.full_name || message.sender_profile?.email || 'Unknown'}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium">
                      {message.receiver_profile?.full_name || message.receiver_profile?.email || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMessageTypeColor(message.message_type)}>
                      {message.message_type}
                    </Badge>
                    {!message.is_read && (
                      <Badge variant="destructive">Unread</Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{message.content}</p>
                <p className="text-sm text-gray-500">
                  {formatDateTime(message.created_at)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search messages or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="delivering">Delivering</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From → To</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Booking Topic</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading messages...
                  </TableCell>
                </TableRow>
              ) : messages?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                messages?.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {message.sender_profile?.full_name || message.sender_profile?.email || 'Unknown'}
                        </div>
                        <div className="text-gray-500">
                          → {message.receiver_profile?.full_name || message.receiver_profile?.email || 'Unknown'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {message.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.booking?.training_topic || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(message.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge className={getMessageTypeColor(message.message_type)}>
                          {message.message_type}
                        </Badge>
                        {!message.is_read && (
                          <Badge variant="destructive">Unread</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBookingId(message.booking_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatAudit;
