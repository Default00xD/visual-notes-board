export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string;
          auth_user_id: string;
          telegram_id: string | null;
          username: string | null;
          avatar: string | null;
          subscription_status: "free" | "pro";
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          telegram_id?: string | null;
          username?: string | null;
          avatar?: string | null;
          subscription_status?: "free" | "pro";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_users"]["Insert"]>;
      };
      boards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["boards"]["Insert"]>;
      };
      blocks: {
        Row: {
          id: string;
          board_id: string;
          parent_block_id: string | null;
          type: "text" | "image" | "checklist" | "likes" | "list" | "folder";
          x: number;
          y: number;
          width: number;
          height: number;
          color: string;
          content: Json;
          z_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          parent_block_id?: string | null;
          type: "text" | "image" | "checklist" | "likes" | "list" | "folder";
          x: number;
          y: number;
          width: number;
          height: number;
          color: string;
          content?: Json;
          z_index?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocks"]["Insert"]>;
      };
    };
  };
}

