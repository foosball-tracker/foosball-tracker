export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      goals: {
        Row: {
          created_at: string;
          goal_time: string;
          id: number;
          match_id: number;
          player_id: number | null;
          team_id: number;
        };
        Insert: {
          created_at?: string;
          goal_time: string;
          id?: number;
          match_id: number;
          player_id?: number | null;
          team_id: number;
        };
        Update: {
          created_at?: string;
          goal_time?: string;
          id?: number;
          match_id?: number;
          player_id?: number | null;
          team_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "goals_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goals_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      match_events: {
        Row: {
          created_at: string;
          dedupe_key: string | null;
          goal_time: string | null;
          id: number;
          match_id: number;
          metadata: Json | null;
          player_id: number | null;
          related_event_id: number | null;
          source: Database["public"]["Enums"]["match_event_source"];
          source_id: string | null;
          status: Database["public"]["Enums"]["match_event_status"];
          team_id: number;
          type: Database["public"]["Enums"]["match_event_type"];
        };
        Insert: {
          created_at?: string;
          dedupe_key?: string | null;
          goal_time?: string | null;
          id?: number;
          match_id: number;
          metadata?: Json | null;
          player_id?: number | null;
          related_event_id?: number | null;
          source: Database["public"]["Enums"]["match_event_source"];
          source_id?: string | null;
          status?: Database["public"]["Enums"]["match_event_status"];
          team_id: number;
          type: Database["public"]["Enums"]["match_event_type"];
        };
        Update: {
          created_at?: string;
          dedupe_key?: string | null;
          goal_time?: string | null;
          id?: number;
          match_id?: number;
          metadata?: Json | null;
          player_id?: number | null;
          related_event_id?: number | null;
          source?: Database["public"]["Enums"]["match_event_source"];
          source_id?: string | null;
          status?: Database["public"]["Enums"]["match_event_status"];
          team_id?: number;
          type?: Database["public"]["Enums"]["match_event_type"];
        };
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_related_event_id_fkey";
            columns: ["related_event_id"];
            isOneToOne: false;
            referencedRelation: "match_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          away_team_id: number;
          created_at: string;
          goals_to_win: number;
          home_team_id: number;
          id: number;
          in_progress: boolean;
        };
        Insert: {
          away_team_id: number;
          created_at?: string;
          goals_to_win: number;
          home_team_id: number;
          id?: number;
          in_progress?: boolean;
        };
        Update: {
          away_team_id?: number;
          created_at?: string;
          goals_to_win?: number;
          home_team_id?: number;
          id?: number;
          in_progress?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          is_admin: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          is_admin?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          is_admin?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sound_assets: {
        Row: {
          checksum: string | null;
          content_type: string;
          created_at: string;
          duration_ms: number;
          id: string;
          is_default: boolean;
          metadata: Json;
          name: string;
          size_bytes: number;
          status: Database["public"]["Enums"]["sound_status"];
          storage_bucket: string;
          storage_path: string;
          type: Database["public"]["Enums"]["sound_type"];
          uploaded_by: string | null;
        };
        Insert: {
          checksum?: string | null;
          content_type?: string;
          created_at?: string;
          duration_ms: number;
          id?: string;
          is_default?: boolean;
          metadata?: Json;
          name: string;
          size_bytes: number;
          status?: Database["public"]["Enums"]["sound_status"];
          storage_bucket?: string;
          storage_path: string;
          type: Database["public"]["Enums"]["sound_type"];
          uploaded_by?: string | null;
        };
        Update: {
          checksum?: string | null;
          content_type?: string;
          created_at?: string;
          duration_ms?: number;
          id?: string;
          is_default?: boolean;
          metadata?: Json;
          name?: string;
          size_bytes?: number;
          status?: Database["public"]["Enums"]["sound_status"];
          storage_bucket?: string;
          storage_path?: string;
          type?: Database["public"]["Enums"]["sound_type"];
          uploaded_by?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          player_id: number;
          team_id: number;
        };
        Insert: {
          player_id: number;
          team_id: number;
        };
        Update: {
          player_id?: number;
          team_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          player_id: number | null;
          type: Database["public"]["Enums"]["team_type"];
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          player_id?: number | null;
          type: Database["public"]["Enums"]["team_type"];
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          player_id?: number | null;
          type?: Database["public"]["Enums"]["team_type"];
        };
        Relationships: [
          {
            foreignKeyName: "teams_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_team_with_members: {
        Args: { p_name: string; p_player_ids: number[] };
        Returns: number;
      };
      current_player_id: { Args: never; Returns: number };
      delete_player_with_linked_team: {
        Args: { target_player_id: number };
        Returns: undefined;
      };
      delete_team: { Args: { target_team_id: number }; Returns: undefined };
      get_match_score: {
        Args: { p_match_id: number };
        Returns: {
          score: number;
          team_id: number;
        }[];
      };
      invalidate_goal_event: {
        Args: { p_event_id: number; p_reason?: string };
        Returns: number;
      };
      is_admin: { Args: never; Returns: boolean };
      is_match_participant: { Args: { p_match_id: number }; Returns: boolean };
      record_goal_event: {
        Args: {
          p_dedupe_key?: string;
          p_goal_time?: string;
          p_match_id: number;
          p_metadata?: Json;
          p_player_id?: number;
          p_source: Database["public"]["Enums"]["match_event_source"];
          p_source_id?: string;
          p_team_id: number;
        };
        Returns: number;
      };
      reset_match_score: {
        Args: { p_match_id: number; p_reason?: string };
        Returns: number;
      };
      update_team_with_members: {
        Args: {
          target_name: string;
          target_player_ids: number[];
          target_team_id: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      match_event_source: "sensor" | "web" | "system";
      match_event_status: "valid" | "invalid" | "removed";
      match_event_type: "goal_detected" | "goal_removed" | "score_reset" | "manual_correction";
      sound_status: "ready" | "disabled";
      sound_type: "goal" | "win";
      team_type: "player" | "team";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      match_event_source: ["sensor", "web", "system"],
      match_event_status: ["valid", "invalid", "removed"],
      match_event_type: ["goal_detected", "goal_removed", "score_reset", "manual_correction"],
      sound_status: ["ready", "disabled"],
      sound_type: ["goal", "win"],
      team_type: ["player", "team"],
    },
  },
} as const;
