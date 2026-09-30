import type { AppState } from "../types";

// Application-owned schema only. Keep this contract in sync with new SQL migrations.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; banned_until: string | null; created_at: string };
        Insert: { id: string; email: string; banned_until?: string | null; created_at?: string };
        Update: { email?: string; banned_until?: string | null };
        Relationships: [];
      };
      account_data: {
        Row: { user_id: string; state: AppState; revision: number; updated_at: string };
        Insert: { user_id: string; state: AppState; revision?: number; updated_at?: string };
        Update: { state?: AppState; revision?: number; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_account_data: { Args: { incoming_state: AppState; expected_revision: number }; Returns: number };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
