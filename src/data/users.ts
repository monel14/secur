
import { User } from '../types';

export const users: { [id: string]: User } = {
    'agent_alice': { id: 'agent_alice', name: 'Alice Diop', email: 'agent.alice@example.com', role: 'agent', agency_id: 'AG001', solde: 150000, commissions_mois_estimees: 12500, commissions_dues: 28000, avatar_seed: 'Alice', status: 'active' },
    'agent_bob': { id: 'agent_bob', name: 'Bob Fall', email: 'agent.bob@example.com', role: 'agent', agency_id: 'AG001', solde: 75000, commissions_mois_estimees: 8000, commissions_dues: 15000, avatar_seed: 'Bob', status: 'active' },
    'agent_carla': { id: 'agent_carla', name: 'Carla Ndiaye', email: 'agent.carla@example.com', role: 'agent', agency_id: 'AG002', solde: 210000, commissions_mois_estimees: 18000, commissions_dues: 45000, avatar_seed: 'Carla', status: 'active' },
    'agent_david': { id: 'agent_david', name: 'David Sarr', email: 'agent.david@example.com', role: 'agent', agency_id: 'AG003', solde: 95000, commissions_mois_estimees: 9200, commissions_dues: 18300, avatar_seed: 'David', status: 'suspended', suspension_reason: 'Audit de compte en cours' },

    'chef_charles': { id: 'chef_charles', name: 'Charles Mendy', email: 'chef.charles@example.com', role: 'chef_agence', agency_id: 'AG001', solde: 1250000, commissions_perso_dues: 50000, volume_agence_mois: 3500000, commissions_agence_mois: 215700, agents_actifs: 2, avatar_seed: 'Charles' },
    'chef_fatou': { id: 'chef_fatou', name: 'Fatou Beye', email: 'chef.fatou@example.com', role: 'chef_agence', agency_id: 'AG002', solde: 980000, commissions_perso_dues: 42000, volume_agence_mois: 2800000, commissions_agence_mois: 180500, agents_actifs: 1, avatar_seed: 'Fatou' },
    'chef_aliou': { id: 'chef_aliou', name: 'Aliou Diallo', email: 'chef.aliou@example.com', role: 'chef_agence', agency_id: 'AG003', solde: 1500000, commissions_perso_dues: 65000, volume_agence_mois: 4200000, commissions_agence_mois: 280000, agents_actifs: 1, avatar_seed: 'Aliou' },
    'chef_bineta': { id: 'chef_bineta', name: 'Bineta Gueye', email: 'chef.bineta@example.com', role: 'chef_agence', agency_id: 'AG004', solde: 750000, commissions_perso_dues: 30000, volume_agence_mois: 1900000, commissions_agence_mois: 120000, agents_actifs: 0, avatar_seed: 'Bineta' },

    'admin_adam': { id: 'admin_adam', name: 'Adam Ba', email: 'admin.adam@example.com', role: 'admin_general', avatar_seed: 'Adam' },
    'sous_admin_sophie': { id: 'sous_admin_sophie', name: 'Sophie Camara', email: 'sa.sophie@example.com', role: 'sous_admin', avatar_seed: 'Sophie', status: 'active', permissions: { can_validate_transactions: true, can_manage_requests: true } },
    'sous_admin_omar': { id: 'sous_admin_omar', name: 'Omar Sy', email: 'sa.omar@example.com', role: 'sous_admin', avatar_seed: 'Omar', status: 'active', permissions: { can_validate_transactions: false, can_manage_requests: true } },
    'dev_david': { id: 'dev_david', name: 'David Moreau', email: 'dev.david@example.com', role: 'developpeur', avatar_seed: 'DevD' },
};
