// ---------------------------------------------------------------------------
// Auto-generated skeleton — regenerate with:
//   supabase gen types typescript --project-id <id> > packages/shared/src/types/database.ts
//
// Hand-maintained until the Supabase project is linked. Keep in sync with migrations.
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MosqueTier   = 'surau' | 'kariah' | 'komuniti'
export type MosqueStatus = 'trial' | 'active' | 'suspended' | 'cancelled'
export type AdminRole    = 'owner' | 'admin' | 'moderator'
export type PrayerName   = 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak'

export interface Database {
  public: {
    Tables: {
      masjid: {
        Row: {
          id: string
          name: string
          slug: string
          address: string | null
          zone_code: string | null
          phone: string | null
          email: string | null
          website: string | null
          tier: MosqueTier
          status: MosqueStatus
          trial_ends_at: string
          subscription_ref: string | null
          theme: Json
          features: Json
          jemaah_count: number
          announcements_this_month: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['masjid']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['masjid']['Insert']>
      }
      jemaah_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          zone_code: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['jemaah_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jemaah_profiles']['Insert']>
      }
      jemaah_follows: {
        Row: {
          id: string
          user_id: string
          mosque_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['jemaah_follows']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['jemaah_follows']['Insert']>
      }
      mosque_admins: {
        Row: {
          id: string
          mosque_id: string
          user_id: string
          role: AdminRole
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mosque_admins']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mosque_admins']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          mosque_id: string
          author_id: string
          title: string
          body: string
          is_pinned: boolean
          published_at: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      doa_wishes: {
        Row: {
          id: string
          user_id: string
          mosque_id: string | null
          doa_text: string
          is_anonymous: boolean
          is_flagged: boolean
          flag_reason: string | null
          aamiin_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['doa_wishes']['Row'], 'id' | 'created_at' | 'updated_at' | 'aamiin_count'>
        Update: Partial<Database['public']['Tables']['doa_wishes']['Insert']>
      }
      doa_aamiin: {
        Row: {
          id: string
          doa_wish_id: string
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['doa_aamiin']['Row'], 'id' | 'created_at'>
        Update: never
      }
      solat_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_logged_at: string | null
          last_reset_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['solat_streaks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['solat_streaks']['Insert']>
      }
      solat_logs: {
        Row: {
          id: string
          user_id: string
          prayer: PrayerName
          is_jemaah: boolean
          logged_at: string
          log_date: string
        }
        Insert: Omit<Database['public']['Tables']['solat_logs']['Row'], 'id'>
        Update: never
      }
      pahala_checklist: {
        Row: {
          id: string
          user_id: string
          checklist_date: string
          subuh_done: boolean
          zohor_done: boolean
          asar_done: boolean
          maghrib_done: boolean
          isyak_done: boolean
          quran_done: boolean
          zikir_done: boolean
          extra: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pahala_checklist']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pahala_checklist']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      mosque_tier:   { Row: MosqueTier }
      mosque_status: { Row: MosqueStatus }
      admin_role:    { Row: AdminRole }
    }
  }
}
