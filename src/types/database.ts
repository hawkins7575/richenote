// ============================================================================
// Supabase 데이터베이스 타입 정의 (자동 생성 기반)
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          plan: 'starter' | 'professional' | 'business' | 'enterprise'
          status: 'active' | 'suspended' | 'trial' | 'inactive'
          trial_ends_at: string | null
          subscription_ends_at: string | null
          business_registration_number: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          branding: Json
          limits: Json
          settings: Json
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          plan?: 'starter' | 'professional' | 'business' | 'enterprise'
          status?: 'active' | 'suspended' | 'trial' | 'inactive'
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          business_registration_number?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          branding?: Json
          limits?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          plan?: 'starter' | 'professional' | 'business' | 'enterprise'
          status?: 'active' | 'suspended' | 'trial' | 'inactive'
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          business_registration_number?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          branding?: Json
          limits?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          role: 'owner' | 'manager' | 'agent' | 'viewer'
          status: 'active' | 'inactive' | 'pending' | 'suspended'
          permissions: Json
          employee_id: string | null
          department: string | null
          hire_date: string | null
          preferences: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
          invited_by: string | null
        }
        Insert: {
          id: string
          tenant_id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          role?: 'owner' | 'manager' | 'agent' | 'viewer'
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          permissions?: Json
          employee_id?: string | null
          department?: string | null
          hire_date?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          invited_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          role?: 'owner' | 'manager' | 'agent' | 'viewer'
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          permissions?: Json
          employee_id?: string | null
          department?: string | null
          hire_date?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          invited_by?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          tenant_id: string
          created_by: string
          assigned_to: string | null
          title: string
          type: '아파트' | '오피스텔' | '원룸' | '빌라' | '단독주택' | '상가' | '사무실' | '기타'
          transaction_type: '매매' | '전세' | '월세' | '단기임대'
          status: '거래중' | '거래완료'
          price: number | null
          deposit: number | null
          monthly_rent: number | null
          maintenance_fee: number | null
          address: string
          detailed_address: string | null
          district: string | null
          neighborhood: string | null
          latitude: number | null
          longitude: number | null
          area: number
          area_common: number | null
          floor: number
          total_floors: number
          rooms: number
          bathrooms: number
          parking: boolean
          parking_spaces: number | null
          elevator: boolean
          options: Json
          landlord_name: string | null
          landlord_phone: string | null
          landlord_email: string | null
          exit_date: string | null
          available_from: string | null
          contract_end_date: string | null
          images: Json
          videos: Json | null
          virtual_tour_url: string | null
          description: string | null
          private_notes: string | null
          highlight_features: Json | null
          tags: Json | null
          view_count: number
          inquiry_count: number
          is_featured: boolean
          is_urgent: boolean
          is_favorite: boolean
          custom_fields: Json | null
          sync_status: 'pending' | 'synced' | 'error' | null
          external_listings: Json | null
          created_at: string
          updated_at: string
          published_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          created_by: string
          assigned_to?: string | null
          title: string
          type: '아파트' | '오피스텔' | '원룸' | '빌라' | '단독주택' | '상가' | '사무실' | '기타'
          transaction_type: '매매' | '전세' | '월세' | '단기임대'
          status?: '거래중' | '거래완료'
          price?: number | null
          deposit?: number | null
          monthly_rent?: number | null
          maintenance_fee?: number | null
          address: string
          detailed_address?: string | null
          district?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
          area: number
          area_common?: number | null
          floor: number
          total_floors: number
          rooms: number
          bathrooms: number
          parking?: boolean
          parking_spaces?: number | null
          elevator?: boolean
          options?: Json
          landlord_name?: string | null
          landlord_phone?: string | null
          landlord_email?: string | null
          exit_date?: string | null
          available_from?: string | null
          contract_end_date?: string | null
          images?: Json
          videos?: Json | null
          virtual_tour_url?: string | null
          description?: string | null
          private_notes?: string | null
          highlight_features?: Json | null
          tags?: Json | null
          view_count?: number
          inquiry_count?: number
          is_featured?: boolean
          is_urgent?: boolean
          is_favorite?: boolean
          custom_fields?: Json | null
          sync_status?: 'pending' | 'synced' | 'error' | null
          external_listings?: Json | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          created_by?: string
          assigned_to?: string | null
          title?: string
          type?: '아파트' | '오피스텔' | '원룸' | '빌라' | '단독주택' | '상가' | '사무실' | '기타'
          transaction_type?: '매매' | '전세' | '월세' | '단기임대'
          status?: '거래중' | '거래완료'
          price?: number | null
          deposit?: number | null
          monthly_rent?: number | null
          maintenance_fee?: number | null
          address?: string
          detailed_address?: string | null
          district?: string | null
          neighborhood?: string | null
          latitude?: number | null
          longitude?: number | null
          area?: number
          area_common?: number | null
          floor?: number
          total_floors?: number
          rooms?: number
          bathrooms?: number
          parking?: boolean
          parking_spaces?: number | null
          elevator?: boolean
          options?: Json
          landlord_name?: string | null
          landlord_phone?: string | null
          landlord_email?: string | null
          exit_date?: string | null
          available_from?: string | null
          contract_end_date?: string | null
          images?: Json
          videos?: Json | null
          virtual_tour_url?: string | null
          description?: string | null
          private_notes?: string | null
          highlight_features?: Json | null
          tags?: Json | null
          view_count?: number
          inquiry_count?: number
          is_featured?: boolean
          is_urgent?: boolean
          is_favorite?: boolean
          custom_fields?: Json | null
          sync_status?: 'pending' | 'synced' | 'error' | null
          external_listings?: Json | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_id: string
          status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          billing_cycle: 'monthly' | 'yearly'
          trial_start: string | null
          trial_end: string | null
          current_period_start: string
          current_period_end: string
          canceled_at: string | null
          ended_at: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          usage: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          plan_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          billing_cycle?: 'monthly' | 'yearly'
          trial_start?: string | null
          trial_end?: string | null
          current_period_start: string
          current_period_end: string
          canceled_at?: string | null
          ended_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          usage?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          plan_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          billing_cycle?: 'monthly' | 'yearly'
          trial_start?: string | null
          trial_end?: string | null
          current_period_start?: string
          current_period_end?: string
          canceled_at?: string | null
          ended_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          usage?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          action: string
          resource: string
          resource_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          action: string
          resource: string
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          action?: string
          resource?: string
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_current_tenant_id: {
        Args: {
          tenant_id: string
        }
        Returns: undefined
      }
      clear_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_tenant_stats: {
        Args: {
          tenant_id: string
        }
        Returns: {
          total_properties: number
          active_properties: number
          total_users: number
          active_users: number
          storage_used_mb: number
          api_calls_this_month: number
          created_this_month: number
        }
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