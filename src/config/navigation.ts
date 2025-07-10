
import { NavLink } from '../types';

// Import Page Components
import { AgentDashboard } from '../features/agent/AgentDashboard';
import { AgentTransactionHistory } from '../features/agent/AgentTransactionHistory';

import { ChefAgenceDashboard } from '../features/chef_agence/ChefAgenceDashboard';
import { ChefManageAgents } from '../features/chef_agence/ChefManageAgents';
import { ChefAgenceHistory } from '../features/chef_agence/ChefAgenceHistory';
import { ChefManageAgentRecharges } from '../features/chef_agence/ChefManageAgentRecharges';
import { ChefCommissions } from '../features/chef_agence/ChefCommissions';

import { AdminGeneralDashboard } from '../features/admin/AdminGeneralDashboard';
import { AdminValidationTransactions } from '../features/admin/AdminValidationTransactions';
import { AdminManageRequests } from '../features/admin/AdminManageRequests';
import { AdminManageAgencies } from '../features/admin/AdminManageAgencies';
import { AdminManageSubAdmins } from '../features/admin/AdminManageSubAdmins';
import { AdminAssignOpsToAgency } from '../features/admin/AdminAssignOpsToAgency';
import { AdminConfigCommissions } from '../features/admin/AdminConfigCommissions';
import { AdminAuditLog } from '../features/admin/AdminAuditLog';

import { SousAdminDashboard } from '../features/sous_admin/SousAdminDashboard';
import { SousAdminValidationTransactions } from '../features/sous_admin/SousAdminValidationTransactions';
import { SousAdminManageRequests } from '../features/sous_admin/SousAdminManageRequests';

import { DevDashboard } from '../features/developpeur/DevDashboard';
import { DevManageOperationTypes } from '../features/developpeur/DevManageOperationTypes';
import { DevSystemConfig } from '../features/developpeur/DevSystemConfig';
import { DevErrorLogs } from '../features/developpeur/DevErrorLogs';

import { UserProfilePage } from '../features/common/UserProfilePage';
import { SettingsPage } from '../features/common/SettingsPage';
import { SubmitRequestPage } from '../features/common/SubmitRequestPage';


export const navigationLinks: { [role: string]: NavLink[] } = {
    agent: [
        { key: 'Tableau de Bord', label: 'Tableau de Bord', icon: 'fa-chart-pie', component: AgentDashboard },
        { key: 'Initier une Opération', label: 'Initier une Opération', icon: 'fa-plus-circle', action: 'openNewOperationModal' },
        { key: 'Historique Opérations', label: 'Historique Opérations', icon: 'fa-history', component: AgentTransactionHistory },
        { key: 'Demander Recharge', label: 'Demander Recharge', icon: 'fa-hand-holding-usd', action: 'openRechargeModal' },
        { key: 'Mes Requêtes', label: 'Mes Requêtes', icon: 'fa-headset', component: SubmitRequestPage },
    ],
    chef_agence: [
        { key: 'Tableau de Bord', label: 'Tableau de Bord', icon: 'fa-chart-line', component: ChefAgenceDashboard },
        { key: 'Gérer mes Agents', label: 'Gérer mes Agents', icon: 'fa-users-cog', component: ChefManageAgents },
        { key: 'Historique Agence', label: 'Historique Agence', icon: 'fa-landmark', component: ChefAgenceHistory },
        { key: 'Initier Opération', label: 'Initier Opération', icon: 'fa-paper-plane', action: 'openNewOperationModal' },
        { key: 'Recharges Agents', label: 'Recharges Agents', icon: 'fa-wallet', component: ChefManageAgentRecharges },
        { key: 'Mes Commissions', label: 'Mes Commissions', icon: 'fa-percent', component: ChefCommissions },
        { key: 'Recharger mon Solde', label: 'Recharger mon Solde', icon: 'fa-funnel-dollar', action: 'openSelfRechargeModal' },
        { key: 'Mes Requêtes', label: 'Mes Requêtes', icon: 'fa-headset', component: SubmitRequestPage },
    ],
    admin_general: [
        { key: 'Tableau de Bord Global', label: 'Tableau de Bord Global', icon: 'fa-globe-americas', component: AdminGeneralDashboard },
        { key: 'Validation Transactions', label: 'Validation Transactions', icon: 'fa-check-circle', component: AdminValidationTransactions },
        { key: 'Gestion des Requêtes', label: 'Gestion des Requêtes', icon: 'fa-envelope-open-text', component: AdminManageRequests },
        { key: 'Gestion des Agences', label: 'Gestion des Agences', icon: 'fa-building', component: AdminManageAgencies },
        { key: 'Gestion Sous-Admins', label: 'Gestion Sous-Admins', icon: 'fa-user-shield', component: AdminManageSubAdmins },
        { key: 'Attribution Services Agences', label: 'Attribution Services', icon: 'fa-store-alt-slash', component: AdminAssignOpsToAgency },
        { key: 'Configuration Commissions', label: 'Configuration Commissions', icon: 'fa-cogs', component: AdminConfigCommissions },
        { key: 'Journal d\'Audit', label: 'Journal d\'Audit', icon: 'fa-clipboard-list', component: AdminAuditLog },
    ],
    sous_admin: [
        { key: 'Tableau de Bord', label: 'Tableau de Bord', icon: 'fa-tachometer-alt', component: SousAdminDashboard },
        { key: 'Validation Transactions', label: 'Validation Transactions', icon: 'fa-check-square', component: SousAdminValidationTransactions },
        { key: 'Gestion des Requêtes', label: 'Gestion des Requêtes', icon: 'fa-headset', component: SousAdminManageRequests },
    ],
    developpeur: [
        { key: 'Dashboard Technique', label: 'Dashboard Technique', icon: 'fa-server', component: DevDashboard },
        { key: 'Types d\'Opérations', label: 'Types d\'Opérations', icon: 'fa-cogs', component: DevManageOperationTypes },
        { key: 'Configuration Globale', label: 'Configuration Globale', icon: 'fa-tools', component: DevSystemConfig },
        { key: 'Journaux d\'Erreurs', label: 'Journaux d\'Erreurs', icon: 'fa-bug', component: DevErrorLogs },
    ]
};
