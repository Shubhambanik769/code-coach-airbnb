
-- Create messages table for chat functionality
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_participants table to track chat relationships
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id, user_id, trainer_id)
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Policy: Users can send messages to users they have bookings with
CREATE POLICY "Users can send messages in their bookings" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id 
      AND (b.student_id = auth.uid() OR b.trainer_id IN (
        SELECT t.id FROM public.trainers t WHERE t.user_id = auth.uid()
      ))
    )
  );

-- Policy: Users can update read status of messages sent to them
CREATE POLICY "Users can update read status" 
  ON public.messages 
  FOR UPDATE 
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Enable RLS on chat_participants table
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view chat participants for their bookings
CREATE POLICY "Users can view chat participants for their bookings" 
  ON public.chat_participants 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    trainer_id IN (
      SELECT t.id FROM public.trainers t WHERE t.user_id = auth.uid()
    )
  );

-- Policy: Users can create chat participants for their bookings
CREATE POLICY "Users can create chat participants" 
  ON public.chat_participants 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() OR 
    trainer_id IN (
      SELECT t.id FROM public.trainers t WHERE t.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own last_read_at
CREATE POLICY "Users can update their own last read time" 
  ON public.chat_participants 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    trainer_id IN (
      SELECT t.id FROM public.trainers t WHERE t.user_id = auth.uid()
    )
  );

-- Admin policy for chat audit
CREATE POLICY "Admins can view all messages for audit" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all chat participants" 
  ON public.chat_participants 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_booking ON public.messages(booking_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_chat_participants_booking ON public.chat_participants(booking_id);
CREATE INDEX idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX idx_chat_participants_trainer ON public.chat_participants(trainer_id);

-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for chat_participants table
ALTER TABLE public.chat_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
