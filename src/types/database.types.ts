export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category_id: string | null;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          description: string | null;
          featured: boolean;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          price: number;
          price_cents: number | null;
          sale_end: string | null;
          sale_price_cents: number | null;
          sale_start: string | null;
          search_vector: unknown | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          description?: string | null;
          featured?: boolean;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          price: number;
          price_cents?: number | null;
          sale_end?: string | null;
          sale_price_cents?: number | null;
          sale_start?: string | null;
          search_vector?: unknown | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          description?: string | null;
          featured?: boolean;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          price?: number;
          price_cents?: number | null;
          sale_end?: string | null;
          sale_price_cents?: number | null;
          sale_start?: string | null;
          search_vector?: unknown | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      product_variants: {
        Row: {
          created_at: string;
          currency: string;
          id: string;
          is_active: boolean;
          name: string;
          price: number;
          price_cents: number | null;
          product_id: string;
          sku: string;
          stock: number;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          price: number;
          price_cents?: number | null;
          product_id: string;
          sku: string;
          stock?: number;
        };
        Update: {
          created_at?: string;
          currency?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          price?: number;
          price_cents?: number | null;
          product_id?: string;
          sku?: string;
          stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      cart_items: {
        Row: {
          created_at: string;
          id: string;
          quantity: number;
          session_id: string | null;
          updated_at: string;
          user_id: string | null;
          variant_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          quantity?: number;
          session_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          quantity?: number;
          session_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cart_items_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      carts: {
        Row: {
          created_at: string;
          id: string;
          session_id: string | null;
          share_token: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          session_id?: string | null;
          share_token?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          session_id?: string | null;
          share_token?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'carts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          id: string;
          payment_id: string | null;
          payment_provider: string;
          shipping: number;
          shipping_address: Json | null;
          shipping_cents: number;
          status: string;
          subtotal: number;
          subtotal_cents: number;
          total: number;
          total_cents: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payment_id?: string | null;
          payment_provider?: string;
          shipping?: number;
          shipping_address?: Json | null;
          shipping_cents?: number;
          status?: string;
          subtotal?: number;
          subtotal_cents?: number;
          total?: number;
          total_cents?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payment_id?: string | null;
          payment_provider?: string;
          shipping?: number;
          shipping_address?: Json | null;
          shipping_cents?: number;
          status?: string;
          subtotal?: number;
          subtotal_cents?: number;
          total?: number;
          total_cents?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_name: string;
          quantity: number;
          total: number;
          total_cents: number;
          unit_price: number;
          unit_price_cents: number;
          variant_id: string | null;
          variant_name: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_name: string;
          quantity: number;
          total: number;
          total_cents?: number;
          unit_price: number;
          unit_price_cents?: number;
          variant_id?: string | null;
          variant_name?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_name?: string;
          quantity?: number;
          total?: number;
          total_cents?: number;
          unit_price?: number;
          unit_price_cents?: number;
          variant_id?: string | null;
          variant_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          },
        ];
      };
      processed_events: {
        Row: {
          created_at: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      failed_webhooks_log: {
        Row: {
          created_at: string;
          error: string | null;
          id: string;
          payload: Json;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          id?: string;
          payload: Json;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          id?: string;
          payload?: Json;
        };
        Relationships: [];
      };
      entitlements: {
        Row: {
          granted_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          granted_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'entitlements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      customer_360: {
        Row: {
          cart_id: string | null;
          email: string | null;
          full_name: string | null;
          id: string | null;
          last_login: string | null;
          last_order_at: string | null;
          ltv_cents: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      set_user_role: {
        Args: {
          target_user_id: string;
          new_role: string;
        };
        Returns: undefined;
      };
      handle_new_user_claims: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      handle_new_user_profile: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      touch_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      products_tsvector_update: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      has_role: {
        Args: {
          required: string;
        };
        Returns: boolean;
      };
      check_order_transition: {
        Args: {
          old_status: string;
          new_status: string;
        };
        Returns: boolean;
      };
      enforce_order_transition: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      get_customer_360: {
        Args: {
          target_user: string;
        };
        Returns: {
          cart_id: string;
          email: string;
          id: string;
          last_login: string;
          ltv_cents: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    keyof (Database['public']['Tables'] & Database['public']['Views']) | { schema: keyof Database },
  TableName extends (PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;
