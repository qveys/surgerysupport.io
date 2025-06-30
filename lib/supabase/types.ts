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
      roles: {
        Row: {
          id: string
          name: string
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          email: string
          full_name: string | null
          phone_number: string | null
          date_of_birth: string | null
          address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: string | null
          allergies: string | null
          medications: string | null
          insurance_provider: string | null
          insurance_policy_number: string | null
          preferred_language: string | null
          role_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string | null
          allergies?: string | null
          medications?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          preferred_language?: string | null
          role_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string | null
          allergies?: string | null
          medications?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          preferred_language?: string | null
          role_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_images: {
        Row: {
          id: string
          patient_id: string
          file_name: string
          file_url: string
          storage_path: string
          image_type: string
          file_size: number | null
          mime_type: string | null
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          file_name: string
          file_url: string
          storage_path: string
          image_type: string
          file_size?: number | null
          mime_type?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          file_name?: string
          file_url?: string
          storage_path?: string
          image_type?: string
          file_size?: number | null
          mime_type?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_images_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          time: string
          type: string
          provider: string | null
          location: string | null
          is_virtual: boolean
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          time: string
          type: string
          provider?: string | null
          location?: string | null
          is_virtual?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          date?: string
          time?: string
          type?: string
          provider?: string | null
          location?: string | null
          is_virtual?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      checklist_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          priority: string | null
          category: string | null
          due_date: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          priority?: string | null
          category?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          priority?: string | null
          category?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          category: string | null
          size_bytes: number | null
          uploaded_by: string | null
          shared: boolean
          urgent: boolean
          file_url: string
          storage_path: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          category?: string | null
          size_bytes?: number | null
          uploaded_by?: string | null
          shared?: boolean
          urgent?: boolean
          file_url: string
          storage_path: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          category?: string | null
          size_bytes?: number | null
          uploaded_by?: string | null
          shared?: boolean
          urgent?: boolean
          file_url?: string
          storage_path?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string | null
          frequency: string | null
          times: string[] | null
          instructions: string | null
          start_date: string
          end_date: string | null
          category: string | null
          side_effects: string[] | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage?: string | null
          frequency?: string | null
          times?: string[] | null
          instructions?: string | null
          start_date: string
          end_date?: string | null
          category?: string | null
          side_effects?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string | null
          frequency?: string | null
          times?: string[] | null
          instructions?: string | null
          start_date?: string
          end_date?: string | null
          category?: string | null
          side_effects?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          patient_id: string
          subject: string | null
          last_message_at: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          subject?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          subject?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          sent_at: string
          read_by: Json
          urgent: boolean
          attachments: string[] | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          sent_at?: string
          read_by?: Json
          urgent?: boolean
          attachments?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          sent_at?: string
          read_by?: Json
          urgent?: boolean
          attachments?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}