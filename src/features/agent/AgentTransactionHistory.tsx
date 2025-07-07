





import React, { useState, useMemo, useEffect } from 'react';
import { PageComponentProps, Transaction, OperationType } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { formatDate, formatAmount } from '../../utils/formatters';
import { getBadgeClass } from '../../utils/uiHelpers';
import { Pagination } from '../../components/common/Pagination';
import { supabase } from '../../supabaseClient';

export const AgentTransactionHistory: React.FC<PageComponentProps> = ({ user, handleAction }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [opTypes, setOpTypes] = useState<Record<string, {name: string}>>({});
    const [profiles, setProfiles] = useState<Record<string, {name: string}>>({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: trxData, error: trxError } = await supabase
                .from('transactions')
                .select('id, created_at, op_type_id, montant_principal, status, proof_url, validateur_id')
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false });

            const { data: opTypesData, error: opTypesError } = await supabase
                .from('operation_types')
                .select('id, name');

            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, name');

            if (trxError || opTypesError || profilesError) {
                console.error(trxError || opTypesError || profilesError);
            } else {
                setTransactions(trxData as unknown as Transaction[] || []);
                const opTypesMap = (opTypesData as any[] || []).reduce((acc, p) => {
                    acc[p.id] = { name: p.name };
                    return acc;
                }, {} as Record<string, {name: string}>);
                setOpTypes(opTypesMap);
                
                const profilesMap = (profilesData as any[] || []).reduce((acc, p) => {
                    acc[p.id] = { name: p.name };
                    return acc;
                }, {} as Record<string, {name: string}>);
                setProfiles(profilesMap);
            }
            setLoading(false);
        };
        fetchData();
    }, [user.id]);
    
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, transactions]);

    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

    const handleTableClick = (e: React.MouseEvent) => {
        const button = (e.target as HTMLElement).closest('button[data-action="viewProof"]');
        if (button) {
            const url = button.getAttribute('data-url');
            if (url && handleAction) {
                handleAction('viewProof', url);
            }
        }
    };
    
    if (loading) return <Card title="Historique des Opérations" icon="fa-history"><div>Chargement...</div></Card>;

    const headers = ['ID Op.', 'Date/Heure', 'Type', 'Montant', 'Statut', 'Preuve', 'Validateur'];
    const rows = paginatedTransactions.map(t => {
        const opType = opTypes[t.op_type_id];
        const validator = t.validateur_id ? profiles[t.validateur_id]?.name : '-';
        return [
            t.id, 
            formatDate(t.created_at), 
            opType ? opType.name : 'N/A', 
            formatAmount(t.montant_principal), 
            `<span class="badge ${getBadgeClass(t.status)}">${t.status}</span>`,
            t.proof_url ? `<button class="text-blue-500 hover:underline" data-action="viewProof" data-url="${t.proof_url}"><i class="fas fa-eye pointer-events-none"></i></button>` : 'N/A',
            validator
        ];
    });
    
    return (
        <Card title="Historique des Opérations" icon="fa-history">
            <div onClick={handleTableClick}>
                <Table headers={headers} rows={rows} tableClasses="w-full table table-sm" />
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};
