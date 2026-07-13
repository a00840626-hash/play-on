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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_key: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          court_id: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          payment_method: string
          starts_at: string
          status: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          court_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          payment_method?: string
          starts_at: string
          status?: string
          total_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          court_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          payment_method?: string
          starts_at?: string
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          requested_by: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          requested_by: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          address: string
          amenities: string[]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          lat: number | null
          lng: number | null
          municipio: string | null
          name: string
          owner_id: string | null
          price_per_hour: number
          sport: string
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          municipio?: string | null
          name: string
          owner_id?: string | null
          price_per_hour?: number
          sport: string
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          municipio?: string | null
          name?: string
          owner_id?: string | null
          price_per_hour?: number
          sport?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_connections: {
        Row: {
          created_at: string
          demo_player_id: string
          id: string
          last_played: string | null
          status: Database["public"]["Enums"]["demo_conn_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          demo_player_id: string
          id?: string
          last_played?: string | null
          status?: Database["public"]["Enums"]["demo_conn_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          demo_player_id?: string
          id?: string
          last_played?: string | null
          status?: Database["public"]["Enums"]["demo_conn_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_connections_demo_player_id_fkey"
            columns: ["demo_player_id"]
            isOneToOne: false
            referencedRelation: "demo_players"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_messages: {
        Row: {
          body: string
          connection_id: string
          id: string
          read_at: string | null
          sender: string
          sent_at: string
          user_id: string
        }
        Insert: {
          body: string
          connection_id: string
          id?: string
          read_at?: string | null
          sender: string
          sent_at?: string
          user_id: string
        }
        Update: {
          body?: string
          connection_id?: string
          id?: string
          read_at?: string | null
          sender?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "demo_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_players: {
        Row: {
          availability: string[] | null
          avatar_seed: string
          bio: string | null
          colonia: string
          display_name: string
          distance_km: number
          id: string
          online: boolean | null
          rating: number
          skill_level: string | null
          sports: string[]
        }
        Insert: {
          availability?: string[] | null
          avatar_seed: string
          bio?: string | null
          colonia: string
          display_name: string
          distance_km: number
          id?: string
          online?: boolean | null
          rating?: number
          skill_level?: string | null
          sports?: string[]
        }
        Update: {
          availability?: string[] | null
          avatar_seed?: string
          bio?: string | null
          colonia?: string
          display_name?: string
          distance_km?: number
          id?: string
          online?: boolean | null
          rating?: number
          skill_level?: string | null
          sports?: string[]
        }
        Relationships: []
      }
      match_participants: {
        Row: {
          id: string
          joined_at: string
          match_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          match_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          match_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          court_id: string | null
          created_at: string
          duration_minutes: number
          host_id: string
          id: string
          location: string | null
          max_players: number
          notes: string | null
          price_per_player: number
          skill_level: string | null
          sport: string
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          court_id?: string | null
          created_at?: string
          duration_minutes?: number
          host_id: string
          id?: string
          location?: string | null
          max_players?: number
          notes?: string | null
          price_per_player?: number
          skill_level?: string | null
          sport: string
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          court_id?: string | null
          created_at?: string
          duration_minutes?: number
          host_id?: string
          id?: string
          location?: string | null
          max_players?: number
          notes?: string | null
          price_per_player?: number
          skill_level?: string | null
          sport?: string
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          connection_id: string
          id: string
          read_at: string | null
          sender_id: string
          sent_at: string
        }
        Insert: {
          body: string
          connection_id: string
          id?: string
          read_at?: string | null
          sender_id: string
          sent_at?: string
        }
        Update: {
          body?: string
          connection_id?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string[] | null
          avatar_url: string | null
          bio: string | null
          broad_area: string | null
          colonia: string | null
          created_at: string
          display_name: string
          distance_km: number | null
          id: string
          is_discoverable: boolean
          municipio: string | null
          onboarded: boolean
          online: boolean | null
          rating: number | null
          skill_level: string | null
          sports: string[] | null
          updated_at: string
        }
        Insert: {
          availability?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          broad_area?: string | null
          colonia?: string | null
          created_at?: string
          display_name?: string
          distance_km?: number | null
          id: string
          is_discoverable?: boolean
          municipio?: string | null
          onboarded?: boolean
          online?: boolean | null
          rating?: number | null
          skill_level?: string | null
          sports?: string[] | null
          updated_at?: string
        }
        Update: {
          availability?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          broad_area?: string | null
          colonia?: string | null
          created_at?: string
          display_name?: string
          distance_km?: number | null
          id?: string
          is_discoverable?: boolean
          municipio?: string | null
          onboarded?: boolean
          online?: boolean | null
          rating?: number | null
          skill_level?: string | null
          sports?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      signups: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          source?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          badges_earned: number
          created_at: string
          current_streak: number
          games_played: number
          last_activity_date: string | null
          longest_streak: number
          overall_level: number
          overall_xp: number
          sports_friends_made: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges_earned?: number
          created_at?: string
          current_streak?: number
          games_played?: number
          last_activity_date?: string | null
          longest_streak?: number
          overall_level?: number
          overall_xp?: number
          sports_friends_made?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges_earned?: number
          created_at?: string
          current_streak?: number
          games_played?: number
          last_activity_date?: string | null
          longest_streak?: number
          overall_level?: number
          overall_xp?: number
          sports_friends_made?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sport_profiles: {
        Row: {
          created_at: string
          games_played: number
          level: number
          skill_level: string | null
          sport: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          games_played?: number
          level?: number
          skill_level?: string | null
          sport: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          games_played?: number
          level?: number
          skill_level?: string | null
          sport?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_sport_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          invalidated_at: string | null
          invalidation_reason: string | null
          is_valid: boolean
          metadata: Json
          source_id: string
          source_table: string
          sport: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          invalidated_at?: string | null
          invalidation_reason?: string | null
          is_valid?: boolean
          metadata?: Json
          source_id: string
          source_table: string
          sport?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          invalidated_at?: string | null
          invalidation_reason?: string | null
          is_valid?: boolean
          metadata?: Json
          source_id?: string
          source_table?: string
          sport?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      is_connection_participant: {
        Args: { _conn: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "rejected"
      demo_conn_status: "none" | "pending" | "accepted"
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
      connection_status: ["pending", "accepted", "rejected"],
      demo_conn_status: ["none", "pending", "accepted"],
    },
  },
} as const
