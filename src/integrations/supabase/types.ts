export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contributions: {
        Row: {
          amount: number
          contribution_status: string | null
          created_at: string | null
          cycle: number
          cycle_label: string
          due_date: string | null
          group_id: string
          id: string
          is_late: boolean | null
          member_id: string
          note: string | null
          paid_at: string | null
          payment_date: string | null
          payment_method: string | null
          status: string
        }
        Insert: {
          amount: number
          contribution_status?: string | null
          created_at?: string | null
          cycle: number
          cycle_label: string
          due_date?: string | null
          group_id: string
          id?: string
          is_late?: boolean | null
          member_id: string
          note?: string | null
          paid_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
        }
        Update: {
          amount?: number
          contribution_status?: string | null
          created_at?: string | null
          cycle?: number
          cycle_label?: string
          due_date?: string | null
          group_id?: string
          id?: string
          is_late?: boolean | null
          member_id?: string
          note?: string | null
          paid_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      cycles: {
        Row: {
          created_at: string
          cycle_number: number
          end_date: string
          group_id: string
          id: string
          payout_date: string | null
          payout_recipient_id: string
          payout_status: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_number: number
          end_date: string
          group_id: string
          id?: string
          payout_date?: string | null
          payout_recipient_id: string
          payout_status?: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_number?: number
          end_date?: string
          group_id?: string
          id?: string
          payout_date?: string | null
          payout_recipient_id?: string
          payout_status?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycles_payout_recipient_id_fkey"
            columns: ["payout_recipient_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          archived: boolean
          auto_approve_members: boolean
          contribution_amount: number
          created_at: string | null
          description: string | null
          frequency: string
          grace_period_days: number | null
          group_name: string
          host_id: string
          id: string
          invite_code: string
          number_of_members: number
          request_expiry_days: number | null
          rotation_order: string
          send_rejection_email: boolean
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          archived?: boolean
          auto_approve_members?: boolean
          contribution_amount: number
          created_at?: string | null
          description?: string | null
          frequency: string
          grace_period_days?: number | null
          group_name: string
          host_id: string
          id?: string
          invite_code: string
          number_of_members: number
          request_expiry_days?: number | null
          rotation_order: string
          send_rejection_email?: boolean
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          archived?: boolean
          auto_approve_members?: boolean
          contribution_amount?: number
          created_at?: string | null
          description?: string | null
          frequency?: string
          grace_period_days?: number | null
          group_name?: string
          host_id?: string
          id?: string
          invite_code?: string
          number_of_members?: number
          request_expiry_days?: number | null
          rotation_order?: string
          send_rejection_email?: boolean
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          email: string
          group_id: string
          id: string
          join_message: string | null
          joined_at: string | null
          name: string
          position: number | null
          rejection_reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          email: string
          group_id: string
          id?: string
          join_message?: string | null
          joined_at?: string | null
          name: string
          position?: number | null
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role: string
          status?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          group_id?: string
          id?: string
          join_message?: string | null
          joined_at?: string | null
          name?: string
          position?: number | null
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          clicked_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          recipient_name: string
          sent_at: string
          status: string
          subject: string
          type: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          recipient_name: string
          sent_at?: string
          status?: string
          subject: string
          type: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string
          sent_at?: string
          status?: string
          subject?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          contribution_reminders: boolean
          created_at: string
          email_notifications: boolean
          id: string
          member_activity: boolean
          payout_notifications: boolean
          sms_contribution_reminders: boolean
          sms_member_activity: boolean
          sms_notifications: boolean
          sms_payout_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          contribution_reminders?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          member_activity?: boolean
          payout_notifications?: boolean
          sms_contribution_reminders?: boolean
          sms_member_activity?: boolean
          sms_notifications?: boolean
          sms_payout_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          contribution_reminders?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          member_activity?: boolean
          payout_notifications?: boolean
          sms_contribution_reminders?: boolean
          sms_member_activity?: boolean
          sms_notifications?: boolean
          sms_payout_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          cycle: number
          group_id: string
          id: string
          member_id: string
          payout_date: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          cycle: number
          group_id: string
          id?: string
          member_id: string
          payout_date: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          cycle?: number
          group_id?: string
          id?: string
          member_id?: string
          payout_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed_at: string | null
          onboarding_dismissed: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          onboarding_completed_at?: string | null
          onboarding_dismissed?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_dismissed?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_approved_members: {
        Args: { group_id_param: string }
        Returns: number
      }
      expire_old_pending_requests: { Args: never; Returns: number }
      generate_invite_code: { Args: never; Returns: string }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      is_approved_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_full: { Args: { group_id_param: string }; Returns: boolean }
      is_group_host: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_in_group: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
