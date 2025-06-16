
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number');

// User validation schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: phoneSchema.optional(),
  avatar_url: z.string().url('Please enter a valid URL').optional(),
});

// Trainer validation schemas
export const trainerApplicationSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  experience_years: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years'),
  hourly_rate: z.number().min(100, 'Hourly rate must be at least ₹100').max(50000, 'Hourly rate cannot exceed ₹50,000'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio cannot exceed 1000 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required').max(10, 'Cannot have more than 10 skills'),
  location: z.string().min(2, 'Location is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

// Booking validation schemas
export const bookingSchema = z.object({
  trainer_id: z.string().uuid('Invalid trainer ID'),
  training_topic: z.string().min(2, 'Training topic is required'),
  start_time: z.string().datetime('Invalid start time'),
  end_time: z.string().datetime('Invalid end time'),
  duration_hours: z.number().min(1, 'Duration must be at least 1 hour').max(8, 'Duration cannot exceed 8 hours'),
  organization_name: z.string().optional(),
  special_requirements: z.string().max(500, 'Special requirements cannot exceed 500 characters').optional(),
});

// Review validation schemas
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
  skills_rating: z.number().min(1, 'Skills rating must be at least 1').max(5, 'Skills rating cannot exceed 5').optional(),
  communication_rating: z.number().min(1, 'Communication rating must be at least 1').max(5, 'Communication rating cannot exceed 5').optional(),
  punctuality_rating: z.number().min(1, 'Punctuality rating must be at least 1').max(5, 'Punctuality rating cannot exceed 5').optional(),
  would_recommend: z.boolean().optional(),
});

// Admin validation schemas
export const platformSettingsSchema = z.object({
  platform_commission: z.number().min(0, 'Commission cannot be negative').max(50, 'Commission cannot exceed 50%'),
  gst_rate: z.number().min(0, 'GST rate cannot be negative').max(30, 'GST rate cannot exceed 30%'),
  minimum_booking_amount: z.number().min(0, 'Minimum booking amount cannot be negative'),
  maximum_booking_hours: z.number().min(1, 'Maximum booking hours must be at least 1').max(24, 'Maximum booking hours cannot exceed 24'),
  cancellation_fee: z.number().min(0, 'Cancellation fee cannot be negative').max(100, 'Cancellation fee cannot exceed 100%'),
});

// Utility functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};
