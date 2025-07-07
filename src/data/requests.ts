
import { Request } from '../types';

export let mockRequests: Request[] = [
    { id: 'REQ001', created_at: '2025-05-08T10:00:00Z', demandeur_id: 'chef_charles', type: 'Demande de Recharge (Chef Agence)', sujet: 'Recharge solde agence Dakar Centre : 1,000,000 XOF', description: 'Pour couvrir les opérations de la semaine.', status: 'Non assignée', assigned_to: null, reponse: null, resolved_by_id: null, resolution_date: null },
    { id: 'REQ002', created_at: '2025-05-07T15:30:00Z', demandeur_id: 'agent_carla', type: 'Signalement Problème', sujet: 'Erreur calcul commission TRN004', description: 'La commission pour la transaction TRN004 semble incorrecte.', status: 'Assignée', assigned_to: 'sous_admin_omar', reponse: 'Vérification en cours.', resolved_by_id: null, resolution_date: null },
    { id: 'REQ003', created_at: '2025-05-06T11:00:00Z', demandeur_id: 'agent_alice', type: 'Suggestion', sujet: 'Ajouter option "Transfert Multiple"', description: 'Serait utile pour envoyer à plusieurs bénéficiaires en une fois.', status: 'Traité', assigned_to: 'admin_adam', reponse: 'Merci pour la suggestion, nous allons l\'étudier.', resolved_by_id: 'admin_adam', resolution_date: '2025-05-06T12:00:00Z' },
    { id: 'REQ004', created_at: '2025-05-09T09:15:00Z', demandeur_id: 'chef_fatou', type: 'Demande de Recharge (Chef Agence)', sujet: 'Recharge solde agence Pikine : 750,000 XOF', description: 'Besoin urgent.', status: 'En cours de traitement', assigned_to: 'admin_adam', reponse: 'Demande prise en compte.', resolved_by_id: null, resolution_date: null },
    { id: 'REQ005', created_at: '2025-05-09T14:00:00Z', demandeur_id: 'agent_david', type: 'Demande Infos', sujet: 'Plafond transfert international?', description: 'Quel est le plafond max pour un transfert vers la France?', status: 'Non assignée', assigned_to: null, reponse: null, resolved_by_id: null, resolution_date: null },
];
