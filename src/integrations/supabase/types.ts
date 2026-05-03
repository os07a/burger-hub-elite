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
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_verified: boolean | null
          check_out: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_verified: boolean | null
          created_at: string
          date: string
          early_leave_minutes: number
          edited_at: string | null
          edited_by: string | null
          employee_id: string
          id: string
          late_minutes: number
          notes: string | null
          overtime_minutes: number
          request_type: string
          status: string
        }
        Insert: {
          check_in?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_verified?: boolean | null
          check_out?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_verified?: boolean | null
          created_at?: string
          date?: string
          early_leave_minutes?: number
          edited_at?: string | null
          edited_by?: string | null
          employee_id: string
          id?: string
          late_minutes?: number
          notes?: string | null
          overtime_minutes?: number
          request_type?: string
          status?: string
        }
        Update: {
          check_in?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_verified?: boolean | null
          check_out?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_verified?: boolean | null
          created_at?: string
          date?: string
          early_leave_minutes?: number
          edited_at?: string | null
          edited_by?: string | null
          employee_id?: string
          id?: string
          late_minutes?: number
          notes?: string | null
          overtime_minutes?: number
          request_type?: string
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
      attendance_audit: {
        Row: {
          attendance_id: string
          changed_at: string
          changed_by: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          attendance_id: string
          changed_at?: string
          changed_by?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          attendance_id?: string
          changed_at?: string
          changed_by?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_audit_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales: {
        Row: {
          card_sales: number
          cash_sales: number
          cogs: number
          created_at: string
          date: string
          delivery_sales: number
          discounts: number
          gross_profit: number
          gross_sales: number
          id: string
          margin: number
          net_sales: number
          notes: string | null
          orders_count: number
          refunds: number
          taxes: number
          total_sales: number
        }
        Insert: {
          card_sales?: number
          cash_sales?: number
          cogs?: number
          created_at?: string
          date?: string
          delivery_sales?: number
          discounts?: number
          gross_profit?: number
          gross_sales?: number
          id?: string
          margin?: number
          net_sales?: number
          notes?: string | null
          orders_count?: number
          refunds?: number
          taxes?: number
          total_sales?: number
        }
        Update: {
          card_sales?: number
          cash_sales?: number
          cogs?: number
          created_at?: string
          date?: string
          delivery_sales?: number
          discounts?: number
          gross_profit?: number
          gross_sales?: number
          id?: string
          margin?: number
          net_sales?: number
          notes?: string | null
          orders_count?: number
          refunds?: number
          taxes?: number
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
          image_url: string | null
          issue_date: string | null
          label: string
          reminder_days_before: number
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
          image_url?: string | null
          issue_date?: string | null
          label: string
          reminder_days_before?: number
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
          image_url?: string | null
          issue_date?: string | null
          label?: string
          reminder_days_before?: number
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
      employee_evaluations: {
        Row: {
          created_at: string
          employee_id: string
          evaluation_date: string
          evaluator: string | null
          goals: string | null
          id: string
          notes: string | null
          period: string
          score: number
          strengths: string | null
          weaknesses: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          evaluation_date?: string
          evaluator?: string | null
          goals?: string | null
          id?: string
          notes?: string | null
          period?: string
          score: number
          strengths?: string | null
          weaknesses?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          evaluation_date?: string
          evaluator?: string | null
          goals?: string | null
          id?: string
          notes?: string | null
          period?: string
          score?: number
          strengths?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_leaves: {
        Row: {
          created_at: string
          days_count: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          notes: string | null
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          days_count?: number
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          notes?: string | null
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          notes?: string | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_penalties: {
        Row: {
          amount: number
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          penalty_date: string
          reason: string
          severity: string
        }
        Insert: {
          amount?: number
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          penalty_date?: string
          reason: string
          severity?: string
        }
        Update: {
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          penalty_date?: string
          reason?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_penalties_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_qualifications: {
        Row: {
          created_at: string
          employee_id: string
          file_url: string | null
          id: string
          institution: string | null
          notes: string | null
          qualification_type: string
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          file_url?: string | null
          id?: string
          institution?: string | null
          notes?: string | null
          qualification_type: string
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          file_url?: string | null
          id?: string
          institution?: string | null
          notes?: string | null
          qualification_type?: string
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_rewards: {
        Row: {
          amount: number
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          reason: string
          reward_date: string
          reward_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          reason: string
          reward_date?: string
          reward_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          reason?: string
          reward_date?: string
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_rewards_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          allowances: Json
          bank_name: string | null
          basic_salary: number
          birth_date: string | null
          contract_end: string | null
          contract_start: string | null
          contract_type: string | null
          created_at: string
          department: string | null
          direct_manager_id: string | null
          emergency_contact: string | null
          hire_date: string | null
          iban: string | null
          id: string
          image_url: string | null
          job_title: string | null
          name: string
          national_id: string | null
          nationality: string | null
          performance_rating: string | null
          performance_tasks: string | null
          phone: string | null
          role: string
          role_short: string | null
          salary: number
          shift_end_time: string | null
          shift_hours: number | null
          shift_start_time: string | null
          status: string
          status_variant: string
          updated_at: string
          work_days: Json
        }
        Insert: {
          address?: string | null
          allowances?: Json
          bank_name?: string | null
          basic_salary?: number
          birth_date?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string
          department?: string | null
          direct_manager_id?: string | null
          emergency_contact?: string | null
          hire_date?: string | null
          iban?: string | null
          id?: string
          image_url?: string | null
          job_title?: string | null
          name: string
          national_id?: string | null
          nationality?: string | null
          performance_rating?: string | null
          performance_tasks?: string | null
          phone?: string | null
          role: string
          role_short?: string | null
          salary?: number
          shift_end_time?: string | null
          shift_hours?: number | null
          shift_start_time?: string | null
          status?: string
          status_variant?: string
          updated_at?: string
          work_days?: Json
        }
        Update: {
          address?: string | null
          allowances?: Json
          bank_name?: string | null
          basic_salary?: number
          birth_date?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string | null
          created_at?: string
          department?: string | null
          direct_manager_id?: string | null
          emergency_contact?: string | null
          hire_date?: string | null
          iban?: string | null
          id?: string
          image_url?: string | null
          job_title?: string | null
          name?: string
          national_id?: string | null
          nationality?: string | null
          performance_rating?: string | null
          performance_tasks?: string | null
          phone?: string | null
          role?: string
          role_short?: string | null
          salary?: number
          shift_end_time?: string | null
          shift_hours?: number | null
          shift_start_time?: string | null
          status?: string
          status_variant?: string
          updated_at?: string
          work_days?: Json
        }
        Relationships: [
          {
            foreignKeyName: "employees_direct_manager_id_fkey"
            columns: ["direct_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      inventory_movements: {
        Row: {
          cost_at_movement: number
          created_at: string
          created_by: string | null
          id: string
          inventory_item_id: string
          movement_type: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          cost_at_movement?: number
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          cost_at_movement?: number
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string | null
          invoice_id: string
          item_name: string
          matched_automatically: boolean
          quantity: number
          total: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          invoice_id: string
          item_name: string
          matched_automatically?: boolean
          quantity?: number
          total?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          invoice_id?: string
          item_name?: string
          matched_automatically?: boolean
          quantity?: number
          total?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          account: string | null
          amount: number
          confidence_score: number | null
          created_at: string
          date: string
          discount: number
          doc_type: string | null
          id: string
          image_url: string | null
          invoice_number: string | null
          month_label: string | null
          notes: string | null
          recipient: string | null
          source: string
          status: string
          subtotal: number
          supplier_id: string | null
          vat_amount: number
        }
        Insert: {
          account?: string | null
          amount?: number
          confidence_score?: number | null
          created_at?: string
          date?: string
          discount?: number
          doc_type?: string | null
          id?: string
          image_url?: string | null
          invoice_number?: string | null
          month_label?: string | null
          notes?: string | null
          recipient?: string | null
          source?: string
          status?: string
          subtotal?: number
          supplier_id?: string | null
          vat_amount?: number
        }
        Update: {
          account?: string | null
          amount?: number
          confidence_score?: number | null
          created_at?: string
          date?: string
          discount?: number
          doc_type?: string | null
          id?: string
          image_url?: string | null
          invoice_number?: string | null
          month_label?: string | null
          notes?: string | null
          recipient?: string | null
          source?: string
          status?: string
          subtotal?: number
          supplier_id?: string | null
          vat_amount?: number
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
      meta_connection: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          fb_page_id: string | null
          id: string
          ig_business_id: string | null
          is_active: boolean
          last_sync_at: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          fb_page_id?: string | null
          id?: string
          ig_business_id?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          fb_page_id?: string | null
          id?: string
          ig_business_id?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
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
      opening_inventory_runs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          run_date: string
          run_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          run_date?: string
          run_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          run_date?: string
          run_type?: string
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
      pos_receipt_items: {
        Row: {
          cost_total: number
          created_at: string
          gross_total: number
          id: string
          item_name: string
          loyverse_item_id: string | null
          net_total: number
          quantity: number
          receipt_date: string
          receipt_number: string
          variant_name: string | null
        }
        Insert: {
          cost_total?: number
          created_at?: string
          gross_total?: number
          id?: string
          item_name: string
          loyverse_item_id?: string | null
          net_total?: number
          quantity?: number
          receipt_date: string
          receipt_number: string
          variant_name?: string | null
        }
        Update: {
          cost_total?: number
          created_at?: string
          gross_total?: number
          id?: string
          item_name?: string
          loyverse_item_id?: string | null
          net_total?: number
          quantity?: number
          receipt_date?: string
          receipt_number?: string
          variant_name?: string | null
        }
        Relationships: []
      }
      pos_receipts: {
        Row: {
          card: number
          cash: number
          cashier_id: string | null
          cashier_name: string | null
          created_at: string
          created_at_pos: string | null
          delivery: number
          discount: number
          gross: number
          id: string
          receipt_date: string
          receipt_number: string
          receipt_type: string
          synced_at: string
          tax: number
          total: number
        }
        Insert: {
          card?: number
          cash?: number
          cashier_id?: string | null
          cashier_name?: string | null
          created_at?: string
          created_at_pos?: string | null
          delivery?: number
          discount?: number
          gross?: number
          id?: string
          receipt_date: string
          receipt_number: string
          receipt_type?: string
          synced_at?: string
          tax?: number
          total?: number
        }
        Update: {
          card?: number
          cash?: number
          cashier_id?: string | null
          cashier_name?: string | null
          created_at?: string
          created_at_pos?: string | null
          delivery?: number
          discount?: number
          gross?: number
          id?: string
          receipt_date?: string
          receipt_number?: string
          receipt_type?: string
          synced_at?: string
          tax?: number
          total?: number
        }
        Relationships: []
      }
      product_recipes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inventory_item_id: string
          notes: string | null
          product_id: string
          quantity_per_unit: number
          unit: string
          updated_at: string
          valid_from: string
          valid_to: string | null
          waste_percentage: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id: string
          notes?: string | null
          product_id: string
          quantity_per_unit: number
          unit: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
          waste_percentage?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_item_id?: string
          notes?: string | null
          product_id?: string
          quantity_per_unit?: number
          unit?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
          waste_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_recipes_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          loyverse_item_id: string | null
          name: string
          price: number
          product_type: string
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
          loyverse_item_id?: string | null
          name: string
          price?: number
          product_type?: string
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
          loyverse_item_id?: string | null
          name?: string
          price?: number
          product_type?: string
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
      restaurant_settings: {
        Row: {
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          radius_meters: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          radius_meters?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          radius_meters?: number
          updated_at?: string
          updated_by?: string | null
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
      social_insights: {
        Row: {
          ai_suggestions: Json
          ai_summary: string | null
          best_post_time: string | null
          bio: string | null
          content_interactions: number
          created_at: string
          engagement_rate: number
          following_count: number
          id: string
          impressions: number
          interactions_change_pct: number
          link_clicks: number
          link_clicks_change_pct: number
          new_followers: number
          period_end: string | null
          platform: string
          posts_count: number
          profile_visits: number
          reach: number
          reach_change_pct: number
          sales_correlation: Json
          source: string
          total_followers: number
          total_likes: number
          updated_at: string
          views: number
          views_change_pct: number
          visits_change_pct: number
          week_start: string
        }
        Insert: {
          ai_suggestions?: Json
          ai_summary?: string | null
          best_post_time?: string | null
          bio?: string | null
          content_interactions?: number
          created_at?: string
          engagement_rate?: number
          following_count?: number
          id?: string
          impressions?: number
          interactions_change_pct?: number
          link_clicks?: number
          link_clicks_change_pct?: number
          new_followers?: number
          period_end?: string | null
          platform?: string
          posts_count?: number
          profile_visits?: number
          reach?: number
          reach_change_pct?: number
          sales_correlation?: Json
          source?: string
          total_followers?: number
          total_likes?: number
          updated_at?: string
          views?: number
          views_change_pct?: number
          visits_change_pct?: number
          week_start: string
        }
        Update: {
          ai_suggestions?: Json
          ai_summary?: string | null
          best_post_time?: string | null
          bio?: string | null
          content_interactions?: number
          created_at?: string
          engagement_rate?: number
          following_count?: number
          id?: string
          impressions?: number
          interactions_change_pct?: number
          link_clicks?: number
          link_clicks_change_pct?: number
          new_followers?: number
          period_end?: string | null
          platform?: string
          posts_count?: number
          profile_visits?: number
          reach?: number
          reach_change_pct?: number
          sales_correlation?: Json
          source?: string
          total_followers?: number
          total_likes?: number
          updated_at?: string
          views?: number
          views_change_pct?: number
          visits_change_pct?: number
          week_start?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          ai_analysis: string | null
          comments: number
          created_at: string
          engagement_score: number
          id: string
          insight_id: string | null
          likes: number
          platform: string
          post_text: string | null
          post_type: string
          post_url: string | null
          posted_at: string | null
          reach: number
          saves: number
          shares: number
        }
        Insert: {
          ai_analysis?: string | null
          comments?: number
          created_at?: string
          engagement_score?: number
          id?: string
          insight_id?: string | null
          likes?: number
          platform?: string
          post_text?: string | null
          post_type?: string
          post_url?: string | null
          posted_at?: string | null
          reach?: number
          saves?: number
          shares?: number
        }
        Update: {
          ai_analysis?: string | null
          comments?: number
          created_at?: string
          engagement_score?: number
          id?: string
          insight_id?: string | null
          likes?: number
          platform?: string
          post_text?: string | null
          post_type?: string
          post_url?: string | null
          posted_at?: string | null
          reach?: number
          saves?: number
          shares?: number
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "social_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          category: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          last_invoice_at: string | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_invoice_at?: string | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_invoice_at?: string | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unmatched_sales: {
        Row: {
          created_at: string
          details: Json
          id: string
          item_name: string
          loyverse_item_id: string | null
          pos_receipt_item_id: string | null
          quantity: number
          reason: string
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          item_name: string
          loyverse_item_id?: string | null
          pos_receipt_item_id?: string | null
          quantity?: number
          reason: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          item_name?: string
          loyverse_item_id?: string | null
          pos_receipt_item_id?: string | null
          quantity?: number
          reason?: string
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
      whatsapp_allowed_senders: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          phone: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          phone: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string
        }
        Relationships: []
      }
      whatsapp_invoice_intake: {
        Row: {
          amount: number | null
          caption: string | null
          created_at: string
          error_message: string | null
          from_phone: string | null
          id: string
          image_url: string | null
          invoice_id: string | null
          media_id: string | null
          meta_message_id: string | null
          processing_time_ms: number | null
          source: string
          status: string
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          caption?: string | null
          created_at?: string
          error_message?: string | null
          from_phone?: string | null
          id?: string
          image_url?: string | null
          invoice_id?: string | null
          media_id?: string | null
          meta_message_id?: string | null
          processing_time_ms?: number | null
          source?: string
          status?: string
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          caption?: string | null
          created_at?: string
          error_message?: string | null
          from_phone?: string | null
          id?: string
          image_url?: string | null
          invoice_id?: string | null
          media_id?: string | null
          meta_message_id?: string | null
          processing_time_ms?: number | null
          source?: string
          status?: string
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          body: string
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          direction: string
          error: string | null
          from_phone: string | null
          id: string
          media_type: string | null
          media_url: string | null
          meta_message_id: string | null
          read_at: string | null
          read_by_user_at: string | null
          sent_at: string
          sent_by: string | null
          status: string
          template_name: string | null
          to_phone: string
        }
        Insert: {
          body: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          direction?: string
          error?: string | null
          from_phone?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          meta_message_id?: string | null
          read_at?: string | null
          read_by_user_at?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          template_name?: string | null
          to_phone: string
        }
        Update: {
          body?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          direction?: string
          error?: string | null
          from_phone?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          meta_message_id?: string | null
          read_at?: string | null
          read_by_user_at?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          template_name?: string | null
          to_phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_inventory_trigger_status: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_inventory_trigger: { Args: { p_enabled: boolean }; Returns: Json }
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
