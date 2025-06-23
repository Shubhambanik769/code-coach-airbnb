export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      bookings: {
        Row: {
          booking_type: string | null
          created_at: string | null
          duration_hours: number
          end_time: string
          id: string
          meeting_link: string | null
          notes: string | null
          organization_name: string | null
          payment_status: string | null
          special_requirements: string | null
          start_time: string
          status: string | null
          student_id: string
          total_amount: number
          trainer_id: string
          training_topic: string
          updated_at: string | null
        }
        Insert: {
          booking_type?: string | null
          created_at?: string | null
          duration_hours: number
          end_time: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          organization_name?: string | null
          payment_status?: string | null
          special_requirements?: string | null
          start_time: string
          status?: string | null
          student_id: string
          total_amount: number
          trainer_id: string
          training_topic: string
          updated_at?: string | null
        }
        Update: {
          booking_type?: string | null
          created_at?: string | null
          duration_hours?: number
          end_time?: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          organization_name?: string | null
          payment_status?: string | null
          special_requirements?: string | null
          start_time?: string
          status?: string | null
          student_id?: string
          total_amount?: number
          trainer_id?: string
          training_topic?: string
          updated_at?: string | null
        }
        Relationships: [
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
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          notification_preferences: Json | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          role?: string
          updated_at?: string | null
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
          availability: Json | null
          bio: string | null
          certification_documents: string[] | null
          created_at: string | null
          demo_video_url: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          location: string | null
          name: string
          rating: number | null
          skills: string[] | null
          specialization: string | null
          status: string | null
          tags: string[] | null
          timezone: string | null
          title: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          certification_documents?: string[] | null
          created_at?: string | null
          demo_video_url?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          name: string
          rating?: number | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tags?: string[] | null
          timezone?: string | null
          title: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          certification_documents?: string[] | null
          created_at?: string | null
          demo_video_url?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          name?: string
          rating?: number | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tags?: string[] | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_feedback_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
