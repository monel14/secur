
export const agencyOperationAccess: { [agencyId: string]: string[] } = {
    'AG001': ['op_transfert_nat', 'op_paiement_sde', 'op_reabo_canal', 'op_paiement_woyofal', 'op_info_solde_ext'],
    'AG002': ['op_transfert_nat', 'op_paiement_sde', 'op_paiement_woyofal'],
    'AG003': ['op_transfert_nat', 'op_reabo_canal'],
    'AG004': ['op_transfert_nat'],
};
