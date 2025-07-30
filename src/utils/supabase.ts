import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log(supabase);


// Database types
export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      designations: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          cnic: string;
          phone_number: string;
          role: 'admin' | 'employee';
          designation_id: string | null;
          department_id: string | null;
          date_of_joining: string;
          salary: number;
          is_active: boolean;
          profile_image: string | null;
          leave_balance: {
            annual: number;
            sick: number;
            casual: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          cnic: string;
          phone_number: string;
          role?: 'admin' | 'employee';
          designation_id?: string | null;
          department_id?: string | null;
          date_of_joining: string;
          salary?: number;
          is_active?: boolean;
          profile_image?: string | null;
          leave_balance?: {
            annual: number;
            sick: number;
            casual: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          cnic?: string;
          phone_number?: string;
          role?: 'admin' | 'employee';
          designation_id?: string | null;
          department_id?: string | null;
          date_of_joining?: string;
          salary?: number;
          is_active?: boolean;
          profile_image?: string | null;
          leave_balance?: {
            annual: number;
            sick: number;
            casual: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          assigned_to: string;
          assigned_by: string;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category: 'development' | 'design' | 'testing' | 'documentation' | 'meeting' | 'review' | 'other';
          due_date: string;
          start_date: string;
          completed_at: string | null;
          estimated_hours: number;
          actual_hours: number;
          progress: number;
          tags: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          assigned_to: string;
          assigned_by: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category?: 'development' | 'design' | 'testing' | 'documentation' | 'meeting' | 'review' | 'other';
          due_date: string;
          start_date?: string;
          completed_at?: string | null;
          estimated_hours?: number;
          actual_hours?: number;
          progress?: number;
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          assigned_to?: string;
          assigned_by?: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category?: 'development' | 'design' | 'testing' | 'documentation' | 'meeting' | 'review' | 'other';
          due_date?: string;
          start_date?: string;
          completed_at?: string | null;
          estimated_hours?: number;
          actual_hours?: number;
          progress?: number;
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}