
import { Notification } from '../types';

// Let's assume 'now' is 2025-05-10T10:00:00Z for consistent relative dates
const now = new Date('2025-05-10T10:00:00Z');

export const mockNotifications: Notification[] = [
    { id: '1', user_id: 'agent_bob', icon: 'fa-check-circle text-green-500', text: "Votre recharge de 50,000 XOF (ARR002) a été approuvée par Charles Mendy.", created_at: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), read: false },
    { id: '2', user_id: 'agent_bob', icon: 'fa-hourglass-half text-yellow-500', text: "Transaction TRN007 en attente de validation.", created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), read: false }, 
    { id: '3', user_id: 'chef_charles', icon: 'fa-wallet text-blue-500', text: "Nouvelle demande de recharge de l'agent Alice Diop (ARR001).", created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), read: false }, 
    { id: '4', user_id: 'all', icon: 'fa-tools text-gray-500', text: "Maintenance système prévue ce soir à 23h.", created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), read: true }, 
    { id: '5', user_id: 'sous_admin_sophie', icon: 'fa-user-tag text-purple-500', text: "La transaction TRN003 vous a été assignée.", created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), read: false }, 
    { id: '6', user_id: 'sous_admin_omar', icon: 'fa-user-tag text-purple-500', text: "La requête REQ002 (Erreur calcul commission) vous a été assignée.", created_at: new Date(now.getTime() - 90 * 60 * 1000).toISOString(), read: false },
    { id: '7', user_id: 'admin_adam', icon: 'fa-hourglass-half text-yellow-500', text: "Nouvelle transaction TRN007 en attente de validation (Agent: Bob Fall).", created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), read: false }, 
    { id: '8', user_id: 'admin_adam', icon: 'fa-inbox text-red-500', text: "Nouvelle requête REQ005 (Demande Infos) non assignée.", created_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), read: false }, 
];
