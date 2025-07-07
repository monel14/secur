
import { AuditLog } from '../types';

export const mockAuditLogs: AuditLog[] = [
    { timestamp: '2025-05-09T10:30:15Z', user: 'Adam Ba', role: 'Admin Général', action: 'Validation Transaction', entity: 'TRN001', details: 'Montant: 25,000 XOF', ip: '192.168.1.10' },
    { timestamp: '2025-05-09T09:15:00Z', user: 'Charles Mendy', role: 'Chef Agence', action: 'Approbation Recharge Agent', entity: 'ARR002 (Agent Bob)', details: 'Montant: 30,000 XOF', ip: '10.0.5.23' },
    { timestamp: '2025-05-08T16:00:00Z', user: 'David Moreau', role: 'Développeur', action: 'Modification Type Opération', entity: 'op_paiement_sde', details: 'Changement commission: 100 XOF', ip: '127.0.0.1' },
    { timestamp: '2025-05-08T14:30:00Z', user: 'Sophie Camara', role: 'Sous-Admin', action: 'Assignation Tâche', entity: 'TRN003', details: 'Assigné à soi-même', ip: '10.0.8.112' },
];
