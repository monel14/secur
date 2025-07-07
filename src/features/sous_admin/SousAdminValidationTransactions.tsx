





import React, { useState, useEffect } from 'react';
import { PageComponentProps, Transaction } from '../../types';
import { AdminQueue } from '../admin/AdminQueue';
import { supabase } from '../../supabaseClient';

export const SousAdminValidationTransactions: React.FC<PageComponentProps> = (props) => {
    const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingTransactions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('id, agent_id, op_type_id, data, montant_principal, frais, montant_total, status, proof_url, commission_generee, validateur_id, motif_rejet, created_at, assigned_to')
                .in('status', ['En attente de validation', 'Assignée (validation en cours)']);
            
            if (error) {
                console.error("Error fetching pending transactions:", error);
            } else {
                setPendingTransactions((data as unknown as Transaction[]) || []);
            }
            setLoading(false);
        };

        fetchPendingTransactions();
    }, []);

    if (loading) {
        return <div>Chargement des transactions...</div>;
    }

    return (
        <AdminQueue
            {...props}
            title="Validation des Transactions (Sous-Admin)"
            icon="fa-check-square"
            items={pendingTransactions}
        />
    );
};
