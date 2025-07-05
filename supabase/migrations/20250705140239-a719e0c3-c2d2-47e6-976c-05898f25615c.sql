-- Add client name and email columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN client_name TEXT,
ADD COLUMN client_email TEXT;