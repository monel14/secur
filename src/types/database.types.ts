
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
          email: string
          id: string
          name: string
          role: string
          solde: number | null
          status: string
          suspension_reason: string | null
        }
        Insert: {
          agency_id?: string | null
          avatar_seed?: string | null
          email: string
          id: string
          name: string
          role?: string
          solde?: number | null
          status?: string
          suspension_reason?: string | null
        }
        Update: {
          agency_id?: string | null
          avatar_seed?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          solde?: number | null
          status?: string
          suspension_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_agency"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
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
      get_my_agency_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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
