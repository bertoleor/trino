export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; full_name: string | null; role: string; created_at: string };
        Insert: { id: string; email: string; full_name?: string | null; role?: string };
        Update: { email?: string; full_name?: string | null; role?: string };
        Relationships: [];
      };
      products: {
        Row: { id: string; name: string; slug: string; description: string | null; price: number; image_url: string | null; is_active: boolean };
        Insert: { name: string; slug: string; price: number };
        Update: { name?: string; slug?: string; price?: number };
        Relationships: [];
      };
      orders: {
        Row: { id: string; user_id: string; status: string; total: number; created_at: string };
        Insert: { user_id: string; status?: string; total: number };
        Update: { status?: string; total?: number };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// DB-SYNC: run `supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.types.ts` after every migration
// Placeholder until B — keep Database sync pattern, Zod schemas must derive from this via DB-SYNC-01
