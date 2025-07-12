export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_configs: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agreements: {
        Row: {
          agreement_terms: Json
          booking_id: string
          client_agreed_at: string | null
          client_signature_status: string
          completed_at: string | null
          created_at: string
          hourly_rate: number
          id: string
          total_cost: number
          trainer_agreed_at: string | null
          trainer_signature_status: string
          updated_at: string
        }
        Insert: {
          agreement_terms?: Json
          booking_id: string
          client_agreed_at?: string | null
          client_signature_status?: string
          completed_at?: string | null
          created_at?: string
          hourly_rate: number
          id?: string
          total_cost: number
          trainer_agreed_at?: string | null
          trainer_signature_status?: string
          updated_at?: string
        }
        Update: {
          agreement_terms?: Json
          booking_id?: string
          client_agreed_at?: string | null
          client_signature_status?: string
          completed_at?: string | null
          created_at?: string
          hourly_rate?: number
          id?: string
          total_cost?: number
          trainer_agreed_at?: string | null
          trainer_signature_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreements_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agreement_id: string | null
          auto_assigned_at: string | null
          booking_type: string | null
          client_email: string | null
          client_name: string | null
          client_payment_amount: number | null
          created_at: string | null
          duration_hours: number
          end_time: string
          id: string
          location_area: string | null
          location_city: string | null
          meeting_link: string | null
          notes: string | null
          organization_name: string | null
          payment_confirmed_at: string | null
          payment_provider: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          payment_url: string | null
          paypal_order_id: string | null
          platform_commission_amount: number | null
          platform_commission_rate: number | null
          platform_fee_amount: number | null
          platform_fee_percentage: number | null
          requires_agreement: boolean
          service_category: string | null
          service_completion_status: string | null
          special_requirements: string | null
          start_time: string
          status: string | null
          student_id: string
          team_size: number | null
          total_amount: number
          trainer_assignment_status: string | null
          trainer_id: string
          trainer_payout_amount: number | null
          training_topic: string
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          agreement_id?: string | null
          auto_assigned_at?: string | null
          booking_type?: string | null
          client_email?: string | null
          client_name?: string | null
          client_payment_amount?: number | null
          created_at?: string | null
          duration_hours: number
          end_time: string
          id?: string
          location_area?: string | null
          location_city?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_name?: string | null
          payment_confirmed_at?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          payment_url?: string | null
          paypal_order_id?: string | null
          platform_commission_amount?: number | null
          platform_commission_rate?: number | null
          platform_fee_amount?: number | null
          platform_fee_percentage?: number | null
          requires_agreement?: boolean
          service_category?: string | null
          service_completion_status?: string | null
          special_requirements?: string | null
          start_time: string
          status?: string | null
          student_id: string
          team_size?: number | null
          total_amount: number
          trainer_assignment_status?: string | null
          trainer_id: string
          trainer_payout_amount?: number | null
          training_topic: string
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          agreement_id?: string | null
          auto_assigned_at?: string | null
          booking_type?: string | null
          client_email?: string | null
          client_name?: string | null
          client_payment_amount?: number | null
          created_at?: string | null
          duration_hours?: number
          end_time?: string
          id?: string
          location_area?: string | null
          location_city?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_name?: string | null
          payment_confirmed_at?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          payment_url?: string | null
          paypal_order_id?: string | null
          platform_commission_amount?: number | null
          platform_commission_rate?: number | null
          platform_fee_amount?: number | null
          platform_fee_percentage?: number | null
          requires_agreement?: boolean
          service_category?: string | null
          service_completion_status?: string | null
          special_requirements?: string | null
          start_time?: string
          status?: string | null
          student_id?: string
          team_size?: number | null
          total_amount?: number
          trainer_assignment_status?: string | null
          trainer_id?: string
          trainer_payout_amount?: number | null
          training_topic?: string
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          last_read_at: string | null
          trainer_id: string
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          trainer_id: string
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          trainer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_links: {
        Row: {
          booking_id: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          token: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          token: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_links_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          communication_rating: number | null
          feedback_link_id: string
          id: string
          organization_name: string | null
          punctuality_rating: number | null
          rating: number
          respondent_email: string
          respondent_name: string
          review_comment: string | null
          skills_rating: number | null
          submitted_at: string
          would_recommend: boolean | null
        }
        Insert: {
          communication_rating?: number | null
          feedback_link_id: string
          id?: string
          organization_name?: string | null
          punctuality_rating?: number | null
          rating: number
          respondent_email: string
          respondent_name: string
          review_comment?: string | null
          skills_rating?: number | null
          submitted_at?: string
          would_recommend?: boolean | null
        }
        Update: {
          communication_rating?: number | null
          feedback_link_id?: string
          id?: string
          organization_name?: string | null
          punctuality_rating?: number | null
          rating?: number
          respondent_email?: string
          respondent_name?: string
          review_comment?: string | null
          skills_rating?: number | null
          submitted_at?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_feedback_link_id_fkey"
            columns: ["feedback_link_id"]
            isOneToOne: false
            referencedRelation: "feedback_links"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          department: string
          description: string
          external_form_link: string | null
          id: string
          location: string
          requirements: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          description: string
          external_form_link?: string | null
          id?: string
          location: string
          requirements?: string[] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          description?: string
          external_form_link?: string | null
          id?: string
          location?: string
          requirements?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_read: boolean
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_batches: {
        Row: {
          batch_name: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          payout_count: number
          processed_at: string | null
          status: string | null
          total_amount: number
          trainer_count: number
        }
        Insert: {
          batch_name: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payout_count: number
          processed_at?: string | null
          status?: string | null
          total_amount: number
          trainer_count: number
        }
        Update: {
          batch_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payout_count?: number
          processed_at?: string | null
          status?: string | null
          total_amount?: number
          trainer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "payout_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_payments: {
        Row: {
          amount_paid: number
          booking_id: string | null
          client_id: string | null
          created_at: string | null
          held_until: string | null
          id: string
          payment_provider: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          platform_fee: number
          released_at: string | null
          trainer_payout: number
          updated_at: string | null
        }
        Insert: {
          amount_paid: number
          booking_id?: string | null
          client_id?: string | null
          created_at?: string | null
          held_until?: string | null
          id?: string
          payment_provider?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          platform_fee: number
          released_at?: string | null
          trainer_payout: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          booking_id?: string | null
          client_id?: string | null
          created_at?: string | null
          held_until?: string | null
          id?: string
          payment_provider?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          platform_fee?: number
          released_at?: string | null
          trainer_payout?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          company_logo_url: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          department: string | null
          designation: string | null
          email: string
          full_name: string | null
          id: string
          linkedin_url: string | null
          notification_preferences: Json | null
          phone: string | null
          role: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email: string
          full_name?: string | null
          id: string
          linkedin_url?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          id: string
          punctuality_rating: number | null
          rating: number
          skills_rating: number | null
          student_id: string
          trainer_id: string
          would_recommend: boolean | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          punctuality_rating?: number | null
          rating: number
          skills_rating?: number | null
          student_id: string
          trainer_id: string
          would_recommend?: boolean | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          punctuality_rating?: number | null
          rating?: number
          skills_rating?: number | null
          student_id?: string
          trainer_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          base_price: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          client_avatar_url: string | null
          client_company: string
          client_name: string
          client_position: string
          company_logo_url: string | null
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_featured: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          client_avatar_url?: string | null
          client_company: string
          client_name: string
          client_position: string
          company_logo_url?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          client_avatar_url?: string | null
          client_company?: string
          client_name?: string
          client_position?: string
          company_logo_url?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainer_assignments: {
        Row: {
          accepted_at: string | null
          assignment_status: string | null
          booking_id: string | null
          created_at: string | null
          decline_reason: string | null
          declined_at: string | null
          id: string
          offered_at: string | null
          response_deadline: string | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          assignment_status?: string | null
          booking_id?: string | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          id?: string
          offered_at?: string | null
          response_deadline?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          assignment_status?: string | null
          booking_id?: string | null
          created_at?: string | null
          decline_reason?: string | null
          declined_at?: string | null
          id?: string
          offered_at?: string | null
          response_deadline?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_availability: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          is_available: boolean
          is_booked: boolean
          start_time: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_available?: boolean
          is_booked?: boolean
          start_time: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean
          is_booked?: boolean
          start_time?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_locations: {
        Row: {
          area: string | null
          city: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          trainer_id: string | null
          travel_radius_km: number | null
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          city: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          trainer_id?: string | null
          travel_radius_km?: number | null
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          trainer_id?: string | null
          travel_radius_km?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_locations_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_payouts: {
        Row: {
          booking_id: string
          created_at: string | null
          gross_amount: number
          id: string
          net_amount: number
          notes: string | null
          paid_at: string | null
          payout_batch_id: string | null
          payout_status: string | null
          platform_commission: number
          trainer_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          notes?: string | null
          paid_at?: string | null
          payout_batch_id?: string | null
          payout_status?: string | null
          platform_commission: number
          trainer_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          paid_at?: string | null
          payout_batch_id?: string | null
          payout_status?: string | null
          platform_commission?: number
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trainer_payouts_batch"
            columns: ["payout_batch_id"]
            isOneToOne: false
            referencedRelation: "payout_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_payouts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_payouts_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_pricing: {
        Row: {
          created_at: string
          hourly_rate: number
          id: string
          pricing_type: string
          session_rate: number | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hourly_rate: number
          id?: string
          pricing_type?: string
          session_rate?: number | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number
          id?: string
          pricing_type?: string
          session_rate?: number | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_pricing_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          achievements: string[] | null
          availability: Json | null
          average_response_time: number | null
          bio: string | null
          certification_documents: string[] | null
          completion_rate: number | null
          created_at: string | null
          demo_video_url: string | null
          education: string[] | null
          experience_years: number | null
          github_profile: string | null
          hourly_rate: number | null
          id: string
          instant_booking_available: boolean | null
          languages_spoken: string[] | null
          last_active_at: string | null
          linkedin_profile: string | null
          location: string | null
          minimum_booking_hours: number | null
          name: string
          portfolio_url: string | null
          rating: number | null
          response_time_hours: number | null
          skills: string[] | null
          specialization: string | null
          status: string | null
          tags: string[] | null
          teaching_methodology: string | null
          timezone: string | null
          title: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          availability?: Json | null
          average_response_time?: number | null
          bio?: string | null
          certification_documents?: string[] | null
          completion_rate?: number | null
          created_at?: string | null
          demo_video_url?: string | null
          education?: string[] | null
          experience_years?: number | null
          github_profile?: string | null
          hourly_rate?: number | null
          id?: string
          instant_booking_available?: boolean | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          linkedin_profile?: string | null
          location?: string | null
          minimum_booking_hours?: number | null
          name: string
          portfolio_url?: string | null
          rating?: number | null
          response_time_hours?: number | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tags?: string[] | null
          teaching_methodology?: string | null
          timezone?: string | null
          title: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          availability?: Json | null
          average_response_time?: number | null
          bio?: string | null
          certification_documents?: string[] | null
          completion_rate?: number | null
          created_at?: string | null
          demo_video_url?: string | null
          education?: string[] | null
          experience_years?: number | null
          github_profile?: string | null
          hourly_rate?: number | null
          id?: string
          instant_booking_available?: boolean | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          linkedin_profile?: string | null
          location?: string | null
          minimum_booking_hours?: number | null
          name?: string
          portfolio_url?: string | null
          rating?: number | null
          response_time_hours?: number | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tags?: string[] | null
          teaching_methodology?: string | null
          timezone?: string | null
          title?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trainers_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_applications: {
        Row: {
          availability_notes: string | null
          created_at: string
          id: string
          message_to_client: string | null
          proposed_duration_hours: number | null
          proposed_end_date: string | null
          proposed_price: number
          proposed_start_date: string | null
          proposed_syllabus: string | null
          request_id: string
          status: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          availability_notes?: string | null
          created_at?: string
          id?: string
          message_to_client?: string | null
          proposed_duration_hours?: number | null
          proposed_end_date?: string | null
          proposed_price: number
          proposed_start_date?: string | null
          proposed_syllabus?: string | null
          request_id: string
          status?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          availability_notes?: string | null
          created_at?: string
          id?: string
          message_to_client?: string | null
          proposed_duration_hours?: number | null
          proposed_end_date?: string | null
          proposed_price?: number
          proposed_start_date?: string | null
          proposed_syllabus?: string | null
          request_id?: string
          status?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_applications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "training_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_applications_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      training_requests: {
        Row: {
          allow_trainer_pricing: boolean | null
          allow_trainer_syllabus: boolean | null
          application_deadline: string | null
          budget_max: number | null
          budget_min: number | null
          client_id: string
          created_at: string
          delivery_mode: string | null
          description: string | null
          duration_hours: number | null
          expected_end_date: string | null
          expected_start_date: string | null
          id: string
          language_preference: string | null
          location: string | null
          selected_trainer_id: string | null
          status: string | null
          syllabus_content: string | null
          syllabus_file_url: string | null
          target_audience: string
          title: string
          tools_required: string[] | null
          updated_at: string
        }
        Insert: {
          allow_trainer_pricing?: boolean | null
          allow_trainer_syllabus?: boolean | null
          application_deadline?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_id: string
          created_at?: string
          delivery_mode?: string | null
          description?: string | null
          duration_hours?: number | null
          expected_end_date?: string | null
          expected_start_date?: string | null
          id?: string
          language_preference?: string | null
          location?: string | null
          selected_trainer_id?: string | null
          status?: string | null
          syllabus_content?: string | null
          syllabus_file_url?: string | null
          target_audience: string
          title: string
          tools_required?: string[] | null
          updated_at?: string
        }
        Update: {
          allow_trainer_pricing?: boolean | null
          allow_trainer_syllabus?: boolean | null
          application_deadline?: string | null
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string
          created_at?: string
          delivery_mode?: string | null
          description?: string | null
          duration_hours?: number | null
          expected_end_date?: string | null
          expected_start_date?: string | null
          id?: string
          language_preference?: string | null
          location?: string | null
          selected_trainer_id?: string | null
          status?: string | null
          syllabus_content?: string | null
          syllabus_file_url?: string | null
          target_audience?: string
          title?: string
          tools_required?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_training_requests_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_requests_selected_trainer_id_fkey"
            columns: ["selected_trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_trainer_payout: {
        Args: { p_booking_id: string; p_commission_rate?: number }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_message: string
          p_data?: Json
        }
        Returns: string
      }
      create_trainer_payout: {
        Args: { p_booking_id: string }
        Returns: string
      }
      generate_agreement_terms: {
        Args: { p_booking_id: string }
        Returns: Json
      }
      generate_feedback_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_unread_notification_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      mark_notifications_read: {
        Args: { notification_ids: string[] }
        Returns: number
      }
    }
    Enums: {
      notification_type:
        | "booking_confirmed"
        | "booking_cancelled"
        | "booking_completed"
        | "training_request_created"
        | "training_application_received"
        | "training_application_accepted"
        | "training_application_rejected"
        | "trainer_approved"
        | "trainer_rejected"
        | "payment_received"
        | "review_received"
        | "system_announcement"
        | "booking_created"
        | "booking_status_changed"
        | "system_alert"
        | "trainer_application"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "booking_confirmed",
        "booking_cancelled",
        "booking_completed",
        "training_request_created",
        "training_application_received",
        "training_application_accepted",
        "training_application_rejected",
        "trainer_approved",
        "trainer_rejected",
        "payment_received",
        "review_received",
        "system_announcement",
        "booking_created",
        "booking_status_changed",
        "system_alert",
        "trainer_application",
      ],
    },
  },
} as const
