


import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '../types';
import { SearchCriteria } from '../types';

// By changing Json to any, we are losing some type safety for JSON columns.
// However, this is a necessary change to fix the "Type instantiation is excessively deep and possibly infinite"
// error that was breaking the Supabase client's type inference for the entire Database.
// The application code already performs casting from the JSON data (e.g., to SearchCriteria),
// so the practical impact on type safety is minimal in this context.
export type Json = any;

// NOTE FOR DEVELOPERS:
// For better maintainability, this Database type definition can be automatically
// generated from your database schema using the Supabase CLI. This ensures your
// app's types always match your database structure.
// Command: `npx supabase gen types typescript --project-id <your-project-id> > services/supabase-types.ts`
// You can then import the generated types here.
export interface Database {
  public: {
    Tables: {
      production_facilities: {
        Row: {
          id: string
          owner_id: string
          name: string
          location: string
          city: string
          contact_info: string
          production_load: number
          product_categories: string[]
          estimated_travel_time: string | null
          general_turnaround_time: string | null
          certifications: string[] | null
          images: string[] | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          location: string
          city: string
          contact_info: string
          production_load: number
          product_categories: string[]
          estimated_travel_time?: string | null
          general_turnaround_time?: string | null
          certifications?: string[] | null
          images?: string[] | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          location?: string
          city?: string
          contact_info?: string
          production_load?: number
          product_categories?: string[]
          estimated_travel_time?: string | null
          general_turnaround_time?: string | null
          certifications?: string[] | null
          images?: string[] | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          estimated_production_time: string
          materials: string[] | null
          capacity_per_week: string | null
          facility_id: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          estimated_production_time: string
          materials?: string[] | null
          capacity_per_week?: string | null
          facility_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          estimated_production_time?: string
          materials?: string[] | null
          capacity_per_week?: string | null
          facility_id?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          client_id: string
          client_name: string
          production_facility_id: string
          production_facility_name: string
          message: string
          timestamp: string
          status: 'New' | 'Viewed' | 'Responded'
          response: string | null
          is_auto_generated: boolean | null
          original_delegation_request_id: string | null
          turnkey_project_id: string | null
        }
        Insert: {
          id?: string
          client_id: string
          client_name: string
          production_facility_id: string
          production_facility_name: string
          message: string
          timestamp?: string
          status?: 'New' | 'Viewed' | 'Responded'
          response?: string | null
          is_auto_generated?: boolean | null
          original_delegation_request_id?: string | null
          turnkey_project_id?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          client_name?: string
          production_facility_id?: string
          production_facility_name?: string
          message?: string
          timestamp?: string
          status?: 'New' | 'Viewed' | 'Responded'
          response?: string | null
          is_auto_generated?: boolean | null
          original_delegation_request_id?: string | null
          turnkey_project_id?: string | null
        }
      }
      users: {
        Row: {
          id: string
          name: string
          role: UserRole
          is_active: boolean | null
        }
        Insert: {
          id?: string
          name: string
          role: UserRole
          is_active?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          role?: UserRole
          is_active?: boolean | null
        }
      }
      employees: {
        Row: {
          id: string
          facility_owner_id: string
          name: string
          default_hourly_rate: number
        }
        Insert: {
          id?: string
          facility_owner_id: string
          name: string
          default_hourly_rate: number
        }
        Update: {
          id?: string
          facility_owner_id?: string
          name?: string
          default_hourly_rate?: number
        }
      }
      work_log_entries: {
        Row: {
          id: string
          facility_owner_id: string
          employee_id: string
          employee_name: string
          date: string
          hours_worked: number
          hourly_rate: number
          calculated_pay: number
          work_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_owner_id: string
          employee_id: string
          employee_name: string
          date: string
          hours_worked: number
          hourly_rate: number
          calculated_pay: number
          work_description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_owner_id?: string
          employee_id?: string
          employee_name?: string
          date?: string
          hours_worked?: number
          hourly_rate?: number
          calculated_pay?: number
          work_description?: string | null
          created_at?: string
        }
      }
      archived_employees: {
        Row: {
          id: string
          facility_owner_id: string
          name: string
          default_hourly_rate: number
          archived_at: string
        }
        Insert: {
          id: string
          facility_owner_id: string
          name: string
          default_hourly_rate: number
          archived_at: string
        }
        Update: {
          id?: string
          facility_owner_id?: string
          name?: string
          default_hourly_rate?: number
          archived_at?: string
        }
      }
      archived_work_log_entries: {
        Row: {
          id: string
          facility_owner_id: string
          employee_id: string
          employee_name: string
          date: string
          hours_worked: number
          hourly_rate: number
          calculated_pay: number
          work_description: string | null
          created_at: string
          archived_at: string
        }
        Insert: {
            id: string
            facility_owner_id: string
            employee_id: string
            employee_name: string
            date: string
            hours_worked: number
            hourly_rate: number
            calculated_pay: number
            work_description?: string | null
            created_at: string
            archived_at: string
        }
        Update: {
            id?: string
            facility_owner_id?: string
            employee_id?: string
            employee_name?: string
            date?: string
            hours_worked?: number
            hourly_rate?: number
            calculated_pay?: number
            work_description?: string | null
            created_at?: string
            archived_at?: string
        }
      }
      delegation_requests: {
        Row: {
            id: string
            client_id: string | null
            client_name: string
            search_criteria: Json
            timestamp: string
            status: 'Новая' | 'В работе' | 'Предложения отправлены' | 'Выполнена' | 'Отменена'
            admin_notes: string | null
            contact_email: string | null
            contact_phone: string | null
            contact_telegram: string | null
        }
        Insert: {
            id?: string
            client_id?: string | null
            client_name: string
            search_criteria: Json
            timestamp?: string
            status?: 'Новая' | 'В работе' | 'Предложения отправлены' | 'Выполнена' | 'Отменена'
            admin_notes?: string | null
            contact_email?: string | null
            contact_phone?: string | null
            contact_telegram?: string | null
        }
        Update: {
            id?: string
            client_id?: string | null
            client_name?: string
            search_criteria?: Json
            timestamp?: string
            status?: 'Новая' | 'В работе' | 'Предложения отправлены' | 'Выполнена' | 'Отменена'
            admin_notes?: string | null
            contact_email?: string | null
            contact_phone?: string | null
            contact_telegram?: string | null
        }
      }
      special_offers: {
        Row: {
            id: string
            facility_id: string
            facility_owner_id: string
            facility_name: string
            title: string
            description: string
            discount_percentage: number | null
            fixed_discount_amount: number | null
            applicable_services: string[] | null
            valid_from: string
            valid_until: string
            promo_code: string | null
            terms_and_conditions: string | null
            image_url: string | null
            created_at: string
            updated_at: string
            is_active: boolean
            view_count: number
        }
        Insert: {
            id?: string
            facility_id: string
            facility_owner_id: string
            facility_name: string
            title: string
            description: string
            discount_percentage?: number | null
            fixed_discount_amount?: number | null
            applicable_services?: string[] | null
            valid_from: string
            valid_until: string
            promo_code?: string | null
            terms_and_conditions?: string | null
            image_url?: string | null
            created_at?: string
            updated_at?: string
            is_active: boolean
            view_count: number
        }
        Update: {
            id?: string
            facility_id?: string
            facility_owner_id?: string
            facility_name?: string
            title?: string
            description?: string
            discount_percentage?: number | null
            fixed_discount_amount?: number | null
            applicable_services?: string[] | null
            valid_from?: string
            valid_until?: string
            promo_code?: string | null
            terms_and_conditions?: string | null
            image_url?: string | null
            created_at?: string
            updated_at?: string
            is_active?: boolean
            view_count?: number
        }
      }
      special_offer_view_logs: {
        Row: {
            id: string
            offer_id: string
            client_id: string
            client_name: string
            viewed_at: string
            follow_up_sent: boolean
            follow_up_message: string | null
        }
        Insert: {
            id?: string
            offer_id: string
            client_id: string
            client_name: string
            viewed_at?: string
            follow_up_sent: boolean
            follow_up_message?: string | null
        }
        Update: {
            id?: string
            offer_id?: string
            client_id?: string
            client_name?: string
            viewed_at?: string
            follow_up_sent?: boolean
            follow_up_message?: string | null
        }
      }
      turnkey_projects: {
        Row: {
            id: string
            client_id: string | null
            client_name: string
            product_description: string
            project_name: string
            stages: Json
            status: 'processing_ai' | 'pending_review' | 'published' | 'in_progress' | 'completed' | 'cancelled'
            created_at: string
            admin_notes: string | null
            product_image_url: string | null
            contact_email: string | null
            contact_phone: string | null
            contact_telegram: string | null
        }
        Insert: {
            id?: string
            client_id?: string | null
            client_name: string
            product_description: string
            project_name: string
            stages: Json
            status: 'processing_ai' | 'pending_review' | 'published' | 'in_progress' | 'completed' | 'cancelled'
            created_at?: string
            admin_notes?: string | null
            product_image_url?: string | null
            contact_email?: string | null
            contact_phone?: string | null
            contact_telegram?: string | null
        }
        Update: {
            id?: string
            client_id?: string | null
            client_name?: string
            product_description?: string
            project_name?: string
            stages?: Json
            status?: 'processing_ai' | 'pending_review' | 'published' | 'in_progress' | 'completed' | 'cancelled'
            created_at?: string
            admin_notes?: string | null
            product_image_url?: string | null
            contact_email?: string | null
            contact_phone?: string | null
            contact_telegram?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_offer_view: {
        Args: {
          offer_id_in: string;
        };
        Returns: undefined;
      };
    }
  }
}


// These variables are read from the environment.
// For Vercel, set them in Project Settings > Environment Variables.
// NOTE: For Vite-based projects, env vars must be prefixed with VITE_
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("Error creating Supabase client. Please check if the URL is valid.", e);
        supabaseInstance = null;
    }
} else {
    console.warn(
`************************************************************
Supabase URL or Key is not configured.
The application will not connect to the database.
ACTION REQUIRED:
1. Go to your Vercel project dashboard.
2. Navigate to Settings > Environment Variables.
3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
   (Find them in your Supabase project > Settings > API)
************************************************************`
    );
}


export const supabase = supabaseInstance;