import { createClient } from '@supabase/supabase-js'

interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: { id: number; name: string; created_at: string }
        Insert: { name: string }
        Update: { name?: string }
        Relationships: []
      }
      votes: {
        Row: { id: number; restaurant: string; user_name: string; user_color: string; created_at: string }
        Insert: { restaurant: string; user_name: string; user_color: string }
        Update: { restaurant?: string; user_name?: string; user_color?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
