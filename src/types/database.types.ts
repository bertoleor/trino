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
      abandoned_cart_logs: {
        Row: {
          cart_id: string | null
          checked_at: string
          id: string
          session_id: string | null
          status: string
        }
        Insert: {
          cart_id?: string | null
          checked_at?: string
          id?: string
          session_id?: string | null
          status?: string
        }
        Update: {
          cart_id?: string | null
          checked_at?: string
          id?: string
          session_id?: string | null
          status?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          share_token: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          share_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          share_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cultura_posts: {
        Row: {
          author_id: string | null
          body: Json | null
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          id: string
          locale: string
          published_at: string | null
          related_product_ids: string[]
          search_vector: unknown
          slug: string
          social_source: string | null
          social_url: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          body?: Json | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          locale: string
          published_at?: string | null
          related_product_ids?: string[]
          search_vector?: unknown
          slug: string
          social_source?: string | null
          social_url?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          body?: Json | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          locale?: string
          published_at?: string | null
          related_product_ids?: string[]
          search_vector?: unknown
          slug?: string
          social_source?: string | null
          social_url?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          granted_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      failed_webhooks_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload: Json
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      fx_rates: {
        Row: {
          base: string
          fetched_at: string
          id: string
          rate: number
          source: string | null
          target: string
        }
        Insert: {
          base?: string
          fetched_at?: string
          id?: string
          rate: number
          source?: string | null
          target: string
        }
        Update: {
          base?: string
          fetched_at?: string
          id?: string
          rate?: number
          source?: string | null
          target?: string
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          created_at: string | null
          key: string
        }
        Insert: {
          created_at?: string | null
          key: string
        }
        Update: {
          created_at?: string | null
          key?: string
        }
        Relationships: []
      }
      keepalive_logs: {
        Row: {
          checked_at: string
          id: string
          source: string
          status: string
        }
        Insert: {
          checked_at?: string
          id?: string
          source: string
          status?: string
        }
        Update: {
          checked_at?: string
          id?: string
          source?: string
          status?: string
        }
        Relationships: []
      }
      launches: {
        Row: {
          created_at: string
          description: string | null
          id: string
          launch_date: string
          product_id: string | null
          status: string
          teaser_image: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          launch_date: string
          product_id?: string | null
          status?: string
          teaser_image?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          launch_date?: string
          product_id?: string | null
          status?: string
          teaser_image?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "launches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_name: string
          quantity: number
          total: number
          total_cents: number
          unit_price: number
          unit_price_cents: number
          variant_id: string
          variant_name: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_name: string
          quantity: number
          total: number
          total_cents?: number
          unit_price: number
          unit_price_cents?: number
          variant_id: string
          variant_name?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          total?: number
          total_cents?: number
          unit_price?: number
          unit_price_cents?: number
          variant_id?: string
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          idempotency_key: string | null
          payment_id: string | null
          payment_provider: string
          price_cents: number | null
          shipping: number
          shipping_address: Json | null
          shipping_cents: number
          status: string
          status_detail: string | null
          storage_path: string | null
          subtotal: number
          subtotal_cents: number
          total: number
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idempotency_key?: string | null
          payment_id?: string | null
          payment_provider?: string
          price_cents?: number | null
          shipping?: number
          shipping_address?: Json | null
          shipping_cents?: number
          status?: string
          status_detail?: string | null
          storage_path?: string | null
          subtotal?: number
          subtotal_cents?: number
          total?: number
          total_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idempotency_key?: string | null
          payment_id?: string | null
          payment_provider?: string
          price_cents?: number | null
          shipping?: number
          shipping_address?: Json | null
          shipping_cents?: number
          status?: string
          status_detail?: string | null
          storage_path?: string | null
          subtotal?: number
          subtotal_cents?: number
          total?: number
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      perf_mutex: {
        Row: {
          key: string
          locked_at: string | null
        }
        Insert: {
          key: string
          locked_at?: string | null
        }
        Update: {
          key?: string
          locked_at?: string | null
        }
        Relationships: []
      }
      processed_events: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          name: string
          price: number
          price_cents: number | null
          product_id: string
          sku: string
          stock: number
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          price_cents?: number | null
          product_id: string
          sku: string
          stock?: number
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          price_cents?: number | null
          product_id?: string
          sku?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          description: string | null
          featured: boolean
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          price_cents: number | null
          sale_end: string | null
          sale_price_cents: number | null
          sale_start: string | null
          search_vector: unknown
          slug: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          price_cents?: number | null
          sale_end?: string | null
          sale_price_cents?: number | null
          sale_start?: string | null
          search_vector?: unknown
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          price_cents?: number | null
          sale_end?: string | null
          sale_price_cents?: number | null
          sale_start?: string | null
          search_vector?: unknown
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          helpful: number
          id: string
          images: string[]
          order_id: string | null
          product_id: string
          rating: number
          status: string
          title: string | null
          user_id: string
          verified_purchase: boolean
        }
        Insert: {
          body?: string | null
          created_at?: string
          helpful?: number
          id?: string
          images?: string[]
          order_id?: string | null
          product_id: string
          rating: number
          status?: string
          title?: string | null
          user_id: string
          verified_purchase?: boolean
        }
        Update: {
          body?: string | null
          created_at?: string
          helpful?: number
          id?: string
          images?: string[]
          order_id?: string | null
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          user_id?: string
          verified_purchase?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string
          event: string
          id: string
          ip: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          session_id: string | null
          share_token: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          session_id?: string | null
          share_token?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          session_id?: string | null
          share_token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      customer_360: {
        Row: {
          cart_id: string | null
          email: string | null
          full_name: string | null
          id: string | null
          last_login: string | null
          last_order_at: string | null
          ltv_cents: number | null
        }
        Insert: {
          cart_id?: never
          email?: string | null
          full_name?: string | null
          id?: string | null
          last_login?: string | null
          last_order_at?: never
          ltv_cents?: never
        }
        Update: {
          cart_id?: never
          email?: string | null
          full_name?: string | null
          id?: string | null
          last_login?: string | null
          last_order_at?: never
          ltv_cents?: never
        }
        Relationships: []
      }
      product_avg_rating: {
        Row: {
          avg_rating: number | null
          product_id: string | null
          review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_to_cart_serializable: {
        Args: { p_product_id: string; p_qty: number; p_session_id: string }
        Returns: Json
      }
      check_order_transition: {
        Args: { new_status: string; old_status: string }
        Returns: boolean
      }
      get_customer_360: {
        Args: { target_user: string }
        Returns: {
          cart_id: string
          email: string
          id: string
          last_login: string
          ltv_cents: number
        }[]
      }
      has_role: { Args: { required: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      merge_cart_serializable: {
        Args: { p_from_session: string; p_user_id: string }
        Returns: Json
      }
      set_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_cultura_occ: {
        Args: { p_expected_updated_at: string; p_id: string; p_title: string }
        Returns: Json
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

