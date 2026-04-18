export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id: string
          id?: string
          notes?: string | null
          status?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales: {
        Row: {
          card_sales: number
          cash_sales: number
          created_at: string
          date: string
          delivery_sales: number
          id: string
          notes: string | null
          orders_count: number
          total_sales: number
        }
        Insert: {
          card_sales?: number
          cash_sales?: number
          created_at?: string
          date?: string
          delivery_sales?: number
          id?: string
          notes?: string | null
          orders_count?: number
          total_sales?: number
        }
        Update: {
          card_sales?: number
          cash_sales?: number
          created_at?: string
          date?: string
          delivery_sales?: number
          id?: string
          notes?: string | null
          orders_count?: number
          total_sales?: number
        }
        Relationships: []
      }
      employee_docs: {
        Row: {
          created_at: string
          details: string | null
          doc_number: string | null
          doc_type: string
          employee_id: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          label: string
          status: string
          status_variant: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          doc_number?: string | null
          doc_type: string
          employee_id: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          label: string
          status: string
          status_variant?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          doc_number?: string | null
          doc_type?: string
          employee_id?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          label?: string
          status?: string
          status_variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_docs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          performance_rating: string | null
          performance_tasks: string | null
          role: string
          role_short: string | null
          salary: number
          status: string
          status_variant: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          performance_rating?: string | null
          performance_tasks?: string | null
          role: string
          role_short?: string | null
          salary?: number
          status?: string
          status_variant?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          performance_rating?: string | null
          performance_tasks?: string | null
          role?: string
          role_short?: string | null
          salary?: number
          status?: string
          status_variant?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string | null
          cost_per_unit: number
          created_at: string
          id: string
          last_restock: string | null
          min_quantity: number
          name: string
          quantity: number
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number
          created_at?: string
          id?: string
          last_restock?: string | null
          min_quantity?: number
          name: string
          quantity?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_per_unit?: number
          created_at?: string
          id?: string
          last_restock?: string | null
          min_quantity?: number
          name?: string
          quantity?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          invoice_number: string | null
          notes: string | null
          status: string
          supplier_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          status?: string
          supplier_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          status?: string
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_customers: {
        Row: {
          created_at: string
          email: string | null
          first_visit: string | null
          id: string
          last_visit: string | null
          loyverse_customer_id: string
          name: string | null
          phone: string | null
          synced_at: string
          tier: string
          total_points: number
          total_spent: number
          total_visits: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_visit?: string | null
          id?: string
          last_visit?: string | null
          loyverse_customer_id: string
          name?: string | null
          phone?: string | null
          synced_at?: string
          tier?: string
          total_points?: number
          total_spent?: number
          total_visits?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          first_visit?: string | null
          id?: string
          last_visit?: string | null
          loyverse_customer_id?: string
          name?: string | null
          phone?: string | null
          synced_at?: string
          tier?: string
          total_points?: number
          total_spent?: number
          total_visits?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string | null
          title: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string | null
          title?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string | null
          title?: string | null
        }
        Relationships: []
      }
      monthly_distributions: {
        Row: {
          created_at: string
          id: string
          month: string
          per_share_amount: number
          reserved_amount: number
          shares_generated: number
          total_revenue: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          per_share_amount?: number
          reserved_amount?: number
          shares_generated?: number
          total_revenue?: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          per_share_amount?: number
          reserved_amount?: number
          shares_generated?: number
          total_revenue?: number
        }
        Relationships: []
      }
      partner_shares: {
        Row: {
          category: string
          committed_date: string | null
          created_at: string
          id: string
          notes: string | null
          paid_date: string | null
          partner_name: string
          share_value: number
          shares_count: number
          updated_at: string
        }
        Insert: {
          category: string
          committed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          partner_name: string
          share_value?: number
          shares_count?: number
          updated_at?: string
        }
        Update: {
          category?: string
          committed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          partner_name?: string
          share_value?: number
          shares_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      pos_receipts: {
        Row: {
          card: number
          cash: number
          created_at: string
          created_at_pos: string | null
          delivery: number
          id: string
          receipt_date: string
          receipt_number: string
          receipt_type: string
          synced_at: string
          total: number
        }
        Insert: {
          card?: number
          cash?: number
          created_at?: string
          created_at_pos?: string | null
          delivery?: number
          id?: string
          receipt_date: string
          receipt_number: string
          receipt_type?: string
          synced_at?: string
          total?: number
        }
        Update: {
          card?: number
          cash?: number
          created_at?: string
          created_at_pos?: string | null
          delivery?: number
          id?: string
          receipt_date?: string
          receipt_number?: string
          receipt_type?: string
          synced_at?: string
          total?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          cost: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      share_milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          id: string
          shares_required: number
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          shares_required: number
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          shares_required?: number
          status?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          category: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "employee"],
    },
  },
} as const
