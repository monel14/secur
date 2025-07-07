
import { OperationType } from '../types';

export let mockOperationTypes: OperationType[] = [
    { 
        id: 'op_transfert_nat', 
        name: 'Transfert National', 
        description: 'Envoi d\'argent domestique', 
        impacts_balance: true,
        proof_is_required: true, 
        status: 'active',
        fields: [
          { id: 'fld_tn_montant', label: 'Montant du Transfert', name: 'montant_transfert', type: 'number', required: true, obsolete: false, placeholder: 'Ex: 50000' },
          { id: 'fld_tn_tel_benef', label: 'Numéro de téléphone bénéficiaire', name: 'tel_beneficiaire', type: 'tel', required: true, obsolete: false, placeholder: 'Ex: 771234567' },
          { id: 'fld_tn_nom_benef', label: 'Nom complet du bénéficiaire', name: 'nom_beneficiaire', type: 'text', required: true, obsolete: false, placeholder: 'Ex: Moussa Fall' },
          { id: 'fld_tn_motif', label: 'Motif (optionnel)', name: 'motif_transfert', type: 'text', required: false, obsolete: false, placeholder: 'Ex: Loyer, Cadeau' },
        ],
        commission_config: { type: 'tiers', tiers: [{from: 0, to: 50000, commission: '250'}, {from: 50001, to: 200000, commission: '1%'}, {from: 200001, to: null, commission: '0.8%'}] }
    },
    { 
        id: 'op_paiement_sde', 
        name: 'Paiement Facture SDE', 
        description: 'Règlement facture eau SDE', 
        impacts_balance: true, 
        proof_is_required: true,
        status: 'active',
        fields: [
          { id: 'fld_sde_ref_client', label: 'Référence Client SDE', name: 'ref_client_sde', type: 'text', required: true, obsolete: false, placeholder: 'Ex: C123456789' },
          { id: 'fld_sde_num_facture', label: 'Numéro de Facture', name: 'num_facture_sde', type: 'text', required: true, obsolete: false, placeholder: 'Ex: F202505-001' },
          { id: 'fld_sde_montant', label: 'Montant à Payer', name: 'montant_sde', type: 'number', required: true, obsolete: false, placeholder: 'Ex: 12500' },
        ],
        commission_config: { type: 'fixed', amount: 100 }
    },
    { 
        id: 'op_reabo_canal', 
        name: 'Réabonnement Canal+', 
        description: 'Réabonnement bouquet Canal+', 
        impacts_balance: true,
        proof_is_required: true, 
        status: 'active',
        fields: [
          { id: 'fld_canal_num_decodeur', label: 'Numéro de Décodeur', name: 'num_decodeur_canal', type: 'text', required: true, obsolete: false, placeholder: 'Ex: 123456789012' },
          { id: 'fld_canal_formule', label: 'Formule Choisie', name: 'formule_canal', type: 'select', options: ['Access', 'Evasion', 'Tout Canal+'], required: true, obsolete: false },
          { id: 'fld_canal_duree', label: 'Durée (mois)', name: 'duree_canal', type: 'number', required: true, obsolete: false, placeholder: '1', defaultValue: 1 },
        ],
        commission_config: { type: 'percentage', rate: 1.5 }
    },
    { 
        id: 'op_info_solde_ext', 
        name: 'Consultation Solde Externe', 
        description: 'Service informatif, ne modifie pas le solde', 
        impacts_balance: false,
        proof_is_required: false, 
        status: 'inactive',
        fields: [
          { id: 'fld_solde_num_compte', label: 'Numéro de Compte Externe', name: 'num_compte_externe', type: 'text', required: true, obsolete: false },
        ],
        commission_config: { type: 'none' }
    },
     { 
        id: 'op_paiement_woyofal', 
        name: 'Paiement Woyofal', 
        description: 'Recharge compteur Woyofal', 
        impacts_balance: true,
        proof_is_required: true, 
        status: 'active',
        fields: [
          { id: 'fld_woyofal_num_compteur', label: 'Numéro de Compteur', name: 'num_compteur_woyofal', type: 'text', required: true, obsolete: false, placeholder: 'Ex: 987654321' },
          { id: 'fld_woyofal_montant', label: 'Montant à Recharger', name: 'montant_woyofal', type: 'number', required: true, obsolete: false, placeholder: 'Ex: 5000' },
        ],
        commission_config: { type: 'fixed', amount: 75 }
    },
];
