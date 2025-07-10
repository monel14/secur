
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_recharge_requests: {
        Row: {
          id: string
          created_at: string
          agent_id: string
          chef_agence_id: string
          amount: number
          status: string
          motif: string | null
          rejection_reason: string | null
          processing_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          agent_id: string
          chef_agence_id: string
          amount: number
          status?: string
          motif?: string | null
          rejection_reason?: string | null
          processing_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          agent_id?: string
          chef_agence_id?: string
          amount?: number
          status?: string
          motif?: string | null
          rejection_reason?: string | null
          processing_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_recharge_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_recharge_requests_chef_agence_id_fkey"
            columns: ["chef_agence_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      agencies: {
        Row: {
          chef_id: string | null
          id: string
          name: string
        }
        Insert: {
          chef_id?: string | null
          id?: string
          name: string
        }
        Update: {
          chef_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agencies_chef_id_fkey"
            columns: ["chef_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: number
          ip_address: string | null
          timestamp: string
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          ip_address?: string | null
          timestamp?: string
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          ip_address?: string | null
          timestamp?: string
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_operation_access: {
        Row: {
          agency_id: string
          created_at: string
          op_type_id: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          op_type_id: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          op_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_operation_access_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_operation_access_op_type_id_fkey"
            columns: ["op_type_id"]
            isOneToOne: false
            referencedRelation: "operation_types"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          icon: string
          id: string
          link: string | null
          read: boolean
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          link?: string | null
          read?: boolean
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          link?: string | null
          read?: boolean
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_types: {
        Row: {
          commission_config: Json | null
          description: string | null
          fields: Json | null
          id: string
          impacts_balance: boolean
          name: string
          proof_is_required: boolean
          status: string
        }
        Insert: {
          commission_config?: Json | null
          description?: string | null
          fields?: Json | null
          id: string
          impacts_balance?: boolean
          name: string
          proof_is_required?: boolean
          status?: string
        }
        Update: {
          commission_config?: Json | null
          description?: string | null
          fields?: Json | null
          id?: string
          impacts_balance?: boolean
          name?: string
          proof_is_required?: boolean
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_id: string | null
          avatar_seed: string | null
          commissions_dues: number
          email: string
          id: string
          name: string
          permissions: Json | null
          role: string
          solde: number | null
          status: string
          suspension_reason: string | null
        }
        Insert: {
          agency_id?: string | null
          avatar_seed?: string | null
          commissions_dues?: number
          email: string
          id: string
          name: string
          permissions?: Json | null
          role?: string
          solde?: number | null
          status?: string
          suspension_reason?: string | null
        }
        Update: {
          agency_id?: string | null
          avatar_seed?: string | null
          commissions_dues?: number
          email?: string
          id?: string
          name?: string
          permissions?: Json | null
          role?: string
          solde?: number | null
          status?: string
          suspension_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          assigned_to: string | null
          attachment_url: string | null
          created_at: string
          demandeur_id: string
          description: string | null
          id: string
          reponse: string | null
          resolution_date: string | null
          resolved_by_id: string | null
          status: string
          sujet: string
          type: string
        }
        Insert: {
          assigned_to?: string | null
          attachment_url?: string | null
          created_at?: string
          demandeur_id: string
          description?: string | null
          id?: string
          reponse?: string | null
          resolution_date?: string | null
          resolved_by_id?: string | null
          status?: string
          sujet: string
          type: string
        }
        Update: {
          assigned_to?: string | null
          attachment_url?: string | null
          created_at?: string
          demandeur_id?: string
          description?: string | null
          id?: string
          reponse?: string | null
          resolution_date?: string | null
          resolved_by_id?: string | null
          status?: string
          sujet?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_demandeur_id_fkey"
            columns: ["demandeur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_resolved_by_id_fkey"
            columns: ["resolved_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          agent_id: string
          assigned_to: string | null
          commission_generee: number
          created_at: string
          data: Json | null
          frais: number
          id: string
          montant_principal: number
          montant_total: number
          motif_rejet: string | null
          op_type_id: string
          proof_url: string | null
          status: string
          validateur_id: string | null
        }
        Insert: {
          agent_id: string
          assigned_to?: string | null
          commission_generee?: number
          created_at?: string
          data?: Json | null
          frais?: number
          id?: string
          montant_principal: number
          montant_total: number
          motif_rejet?: string | null
          op_type_id: string
          proof_url?: string | null
          status?: string
          validateur_id?: string | null
        }
        Update: {
          agent_id?: string
          assigned_to?: string | null
          commission_generee?: number
          created_at?: string
          data?: Json | null
          frais?: number
          id?: string
          montant_principal?: number
          montant_total?: number
          motif_rejet?: string | null
          op_type_id?: string
          proof_url?: string | null
          status?: string
          validateur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_op_type_id_fkey"
            columns: ["op_type_id"]
            isOneToOne: false
            referencedRelation: "operation_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_validateur_id_fkey"
            columns: ["validateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_agent_recharge: {
        Args: {
          p_request_id: string
          p_approving_chef_id: string
        }
        Returns: undefined
      }
      create_secure_transaction: {
        Args: {
          p_agent_id: string
          p_op_type_id: string
          p_data: Json
          p_proof_url: string | null
        }
        Returns: string
      }
      direct_recharge_agent: {
        Args: {
          p_agent_id: string
          p_chef_id: string
          p_recharge_amount: number
        }
        Returns: undefined
      }
      get_agent_dashboard_stats: {
        Args: {
          p_agent_id: string
        }
        Returns: Json
      }
      get_agency_list_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          chef_id: string | null
          chef_name: string | null
          chef_avatar_seed: string | null
          agent_count: number
        }[]
      }
      get_available_op_types_for_agency: {
        Args: {
          p_agency_id: string
        }
        Returns: {
          id: string
          name: string
          description: string | null
          status: string
          impacts_balance: boolean
          proof_is_required: boolean
          fields: Json | null
          commission_config: Json | null
        }[]
      }
      get_chef_dashboard_stats: {
        Args: {
          p_chef_id: string
        }
        Returns: Json
      }
      get_global_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_my_agency_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_sous_admin_dashboard_stats: {
        Args: {
          p_sous_admin_id: string
        }
        Returns: Json
      }
      get_sub_admin_list_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          avatar_seed: string | null
          status: string
          suspension_reason: string | null
          permissions: Json | null
          assigned_tasks: number
        }[]
      }
      transfer_commissions_to_balance: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: undefined
      }
      update_agency_op_access: {
        Args: {
          p_agency_id: string
          p_op_type_ids: string[]
        }
        Returns: undefined
      }
      update_transaction_status: {
        Args: {
          p_transaction_id: string
          p_new_status: string
          p_rejection_reason?: string | null
        }
        Returns: undefined
      }
      update_user_status: {
        Args: {
          p_target_user_id: string
          p_new_status: string
          p_reason?: string | null
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
