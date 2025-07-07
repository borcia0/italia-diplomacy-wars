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
      alliances: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          proposer_id: string
          status: Database["public"]["Enums"]["alliance_status"] | null
          target_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          proposer_id: string
          status?: Database["public"]["Enums"]["alliance_status"] | null
          target_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          proposer_id?: string
          status?: Database["public"]["Enums"]["alliance_status"] | null
          target_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      army_units: {
        Row: {
          attack_power: number | null
          created_at: string | null
          defense_power: number | null
          id: string
          quantity: number | null
          region: Database["public"]["Enums"]["region_name"]
          type: Database["public"]["Enums"]["unit_type"]
          user_id: string
        }
        Insert: {
          attack_power?: number | null
          created_at?: string | null
          defense_power?: number | null
          id?: string
          quantity?: number | null
          region: Database["public"]["Enums"]["region_name"]
          type: Database["public"]["Enums"]["unit_type"]
          user_id: string
        }
        Update: {
          attack_power?: number | null
          created_at?: string | null
          defense_power?: number | null
          id?: string
          quantity?: number | null
          region?: Database["public"]["Enums"]["region_name"]
          type?: Database["public"]["Enums"]["unit_type"]
          user_id?: string
        }
        Relationships: []
      }
      buildings: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          production: number | null
          region: Database["public"]["Enums"]["region_name"]
          type: Database["public"]["Enums"]["building_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          production?: number | null
          region: Database["public"]["Enums"]["region_name"]
          type: Database["public"]["Enums"]["building_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          production?: number | null
          region?: Database["public"]["Enums"]["region_name"]
          type?: Database["public"]["Enums"]["building_type"]
          user_id?: string
        }
        Relationships: []
      }
      market_offers: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          is_active: boolean | null
          price: number
          quantity: number
          resource_type: string
          seller_id: string
        }
        Insert: {
          created_at?: string | null
          currency: string
          id?: string
          is_active?: boolean | null
          price: number
          quantity: number
          resource_type: string
          seller_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          price?: number
          quantity?: number
          resource_type?: string
          seller_id?: string
        }
        Relationships: []
      }
      minigame_stats: {
        Row: {
          created_at: string
          dice_plays_today: number | null
          id: string
          last_dice_play: string | null
          last_memory_play: string | null
          last_puzzle_play: string | null
          last_slot_play: string | null
          last_target_play: string | null
          memory_plays_today: number | null
          puzzle_plays_today: number | null
          slot_plays_today: number | null
          target_plays_today: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dice_plays_today?: number | null
          id?: string
          last_dice_play?: string | null
          last_memory_play?: string | null
          last_puzzle_play?: string | null
          last_slot_play?: string | null
          last_target_play?: string | null
          memory_plays_today?: number | null
          puzzle_plays_today?: number | null
          slot_plays_today?: number | null
          target_plays_today?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dice_plays_today?: number | null
          id?: string
          last_dice_play?: string | null
          last_memory_play?: string | null
          last_puzzle_play?: string | null
          last_slot_play?: string | null
          last_target_play?: string | null
          memory_plays_today?: number | null
          puzzle_plays_today?: number | null
          slot_plays_today?: number | null
          target_plays_today?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          current_region: Database["public"]["Enums"]["region_name"] | null
          email: string
          id: string
          last_active: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          current_region?: Database["public"]["Enums"]["region_name"] | null
          email: string
          id: string
          last_active?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          current_region?: Database["public"]["Enums"]["region_name"] | null
          email?: string
          id?: string
          last_active?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          capital: string
          created_at: string | null
          id: string
          name: Database["public"]["Enums"]["region_name"]
          owner_id: string | null
          population: number | null
        }
        Insert: {
          capital: string
          created_at?: string | null
          id?: string
          name: Database["public"]["Enums"]["region_name"]
          owner_id?: string | null
          population?: number | null
        }
        Update: {
          capital?: string
          created_at?: string | null
          id?: string
          name?: Database["public"]["Enums"]["region_name"]
          owner_id?: string | null
          population?: number | null
        }
        Relationships: []
      }
      user_resources: {
        Row: {
          carbone: number | null
          cibo: number | null
          ferro: number | null
          id: string
          pietra: number | null
          pizza: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          carbone?: number | null
          cibo?: number | null
          ferro?: number | null
          id?: string
          pietra?: number | null
          pizza?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          carbone?: number | null
          cibo?: number | null
          ferro?: number | null
          id?: string
          pietra?: number | null
          pizza?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wars: {
        Row: {
          attacker_id: string
          attacker_troops: Json | null
          defender_id: string
          defender_troops: Json | null
          id: string
          resolved_at: string | null
          result: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["war_status"] | null
          target_region: Database["public"]["Enums"]["region_name"]
        }
        Insert: {
          attacker_id: string
          attacker_troops?: Json | null
          defender_id: string
          defender_troops?: Json | null
          id?: string
          resolved_at?: string | null
          result?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["war_status"] | null
          target_region: Database["public"]["Enums"]["region_name"]
        }
        Update: {
          attacker_id?: string
          attacker_troops?: Json | null
          defender_id?: string
          defender_troops?: Json | null
          id?: string
          resolved_at?: string | null
          result?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["war_status"] | null
          target_region?: Database["public"]["Enums"]["region_name"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_play_minigame: {
        Args: { p_user_id: string; p_game_type: string }
        Returns: boolean
      }
      reset_daily_minigame_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_minigame_stats: {
        Args: { p_user_id: string; p_game_type: string }
        Returns: undefined
      }
    }
    Enums: {
      alliance_status: "pending" | "accepted" | "rejected" | "active"
      building_type: "fattoria" | "cava" | "miniera" | "pizzeria" | "caserma"
      region_name:
        | "lazio"
        | "lombardia"
        | "campania"
        | "sicilia"
        | "piemonte"
        | "veneto"
        | "emilia-romagna"
        | "toscana"
        | "puglia"
        | "calabria"
        | "sardegna"
        | "liguria"
        | "marche"
        | "abruzzo"
        | "umbria"
        | "basilicata"
        | "molise"
        | "friuli"
        | "trentino"
        | "valle-daosta"
      unit_type: "legionari" | "arcieri" | "cavalieri" | "catapulte"
      war_status: "declared" | "active" | "resolved"
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
      alliance_status: ["pending", "accepted", "rejected", "active"],
      building_type: ["fattoria", "cava", "miniera", "pizzeria", "caserma"],
      region_name: [
        "lazio",
        "lombardia",
        "campania",
        "sicilia",
        "piemonte",
        "veneto",
        "emilia-romagna",
        "toscana",
        "puglia",
        "calabria",
        "sardegna",
        "liguria",
        "marche",
        "abruzzo",
        "umbria",
        "basilicata",
        "molise",
        "friuli",
        "trentino",
        "valle-daosta",
      ],
      unit_type: ["legionari", "arcieri", "cavalieri", "catapulte"],
      war_status: ["declared", "active", "resolved"],
    },
  },
} as const
