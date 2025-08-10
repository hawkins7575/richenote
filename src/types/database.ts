// ============================================================================
// Supabase Database Types
// ============================================================================

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          title: string;
          property_type: string;
          transaction_type: string;
          status: string;
          address: string;
          area_exclusive: number;
          floor_current: number;
          floor_total: number;
          rooms: number;
          bathrooms: number;
          price: number | null;
          deposit: number | null;
          monthly_rent: number | null;
          description: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          title: string;
          property_type: string;
          transaction_type: string;
          status?: string;
          address: string;
          area_exclusive?: number;
          floor_current?: number;
          floor_total?: number;
          rooms?: number;
          bathrooms?: number;
          price?: number | null;
          deposit?: number | null;
          monthly_rent?: number | null;
          description?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          title?: string;
          property_type?: string;
          transaction_type?: string;
          status?: string;
          address?: string;
          area_exclusive?: number;
          floor_current?: number;
          floor_total?: number;
          rooms?: number;
          bathrooms?: number;
          price?: number | null;
          deposit?: number | null;
          monthly_rent?: number | null;
          description?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          title: string;
          description: string | null;
          date: string;
          time: string;
          category: string;
          priority: string;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          date: string;
          time: string;
          category: string;
          priority?: string;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          time?: string;
          category?: string;
          priority?: string;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          plan: string;
          status: string;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: string;
          status?: string;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan?: string;
          status?: string;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: string;
          company: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          role?: string;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          role?: string;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}