export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          subscription_status: 'none' | 'basic' | 'premium' | 'unlimited';
          subscription_id: string | null;
          screams_this_month: number;
          subscription_end_date: string | null;
          auto_renewal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          subscription_status?: 'none' | 'basic' | 'premium' | 'unlimited';
          subscription_id?: string | null;
          screams_this_month?: number;
          subscription_end_date?: string | null;
          auto_renewal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          subscription_status?: 'none' | 'basic' | 'premium' | 'unlimited';
          subscription_id?: string | null;
          screams_this_month?: number;
          subscription_end_date?: string | null;
          auto_renewal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      screams: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          audio_url: string;
          duration: number;
          max_pitch: number;
          file_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          audio_url: string;
          duration: number;
          max_pitch: number;
          file_size: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          audio_url?: string;
          duration?: number;
          max_pitch?: number;
          file_size?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}