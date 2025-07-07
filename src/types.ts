import React from 'react';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// --- Base Types ---
interface BaseUser {
  id: string;
  name: string;
  email: string;
  avatar_seed: string | null;
}

// --- Role-Specific User Types ---
export interface Agent extends BaseUser {
  role: 'agent';
  agency_id: string | null;
  solde: number | null;
  status?: 'active' | 'suspended';
  suspension_reason?: string | null;
  creation_date?: string;
  transactions_this_month?: number;
  commissions_mois_estimees?: number;
  commissions_dues?: number;
}

export interface ChefAgence extends BaseUser {
  role: 'chef_agence';
  agency_id: string | null;
  solde: number | null;
  commissions_perso_dues?: number;
  volume_agence_mois?: number;
  commissions_agence_mois?: number;
  agents_actifs?: number;
}

export interface AdminGeneral extends BaseUser {
  role: 'admin_general';
}

export interface SousAdmin extends BaseUser {
  role: 'sous_admin';
  status?: 'active' | 'suspended';
  permissions?: {
    can_validate_transactions: boolean;
    can_manage_requests: boolean;
  };
  suspension_reason?: string | null;
}

export interface Developpeur extends BaseUser {
  role: 'developpeur';
}

// --- Discriminated Union for User ---
export type User = Agent | ChefAgence | AdminGeneral | SousAdmin | Developpeur;

// --- Data Structure Types ---
export interface Agency {
  id: string;
  name: string;
  chef_id: string | null;
}

export interface FormField {
  id: string;
  label: string;
  name: string;
  type: 'text' | 'number' | 'tel' | 'select' | 'date';
  required: boolean;
  obsolete: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number;
}

export interface CommissionTier {
    from: number;
    to: number | null; // Use null for infinity
    commission: string | number;
}

export interface CommissionConfig {
    type: 'none' | 'fixed' | 'percentage' | 'tiers';
    amount?: number;
    rate?: number;
    tiers?: CommissionTier[];
}

export interface OperationType {
  id:string;
  name: string;
  description: string;
  impacts_balance: boolean;
  proof_is_required: boolean;
  status: 'active' | 'inactive' | 'archived' | string;
  fields: FormField[];
  commission_config: CommissionConfig;
}

export interface Transaction {
  id: string;
  created_at: string;
  agent_id: string;
  op_type_id: string;
  data: Json; // Using Json for Supabase JSON type
  montant_principal: number;
  frais: number;
  montant_total: number;
  status: 'Validé' | 'En attente de validation' | 'Rejeté' | string;
  proof_url: string | null;
  commission_generee: number;
  validateur_id: string | null;
  motif_rejet: string | null;
  assigned_to: string | null;
}

export interface AgentRechargeRequest {
    id: string;
    created_at: string;
    agent_id: string;
    chef_agence_id: string;
    amount: number;
    status: 'En attente Chef Agence' | 'Approuvée' | 'Rejetée' | string;
    motif: string | null;
    rejection_reason?: string | null;
    processing_date?: string | null;
}

export interface Request {
  id: string;
  created_at: string;
  demandeur_id: string;
  type: string;
  sujet: string;
  description: string;
  attachment_url?: string | null;
  status: string;
  assigned_to: string | null;
  reponse: string | null;
  resolved_by_id: string | null;
  resolution_date: string | null;
}

export interface AuditLog {
    timestamp: string;
    user: string;
    role: string;
    action: string;
    entity: string;
    details: string;
    ip: string;
}

export interface ErrorLog {
    timestamp: string;
    level: 'Erreur' | 'Avertissement' | 'Info';
    message: string;
    trace: string;
}

export interface Notification {
  id: string;
  user_id: string | null; // Can be 'all'
  icon: string;
  text: string;
  created_at: string;
  read: boolean;
  link?: string;
}

// --- Navigation and Component Props ---
export interface PageComponentProps {
    user: User;
    navigateTo: (pageKey: string, data?: any) => void;
    handleAction: (actionKey: string, data?: any) => void;
}

export interface NavLink {
  key: string;
  label: string;
  icon: string;
  component?: React.FC<PageComponentProps>;
  action?: string;
}