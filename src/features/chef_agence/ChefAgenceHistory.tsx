





import React, { useState, useMemo, useEffect } from 'react';
import { PageComponentProps, ChefAgence, Agent, Transaction, OperationType, FormField, CommissionConfig } from '../../types';
import { Card } from '../../components/common/Card';
import { formatDate, formatAmount } from '../../utils/formatters';
import { getBadgeClass } from '../../utils/uiHelpers';
import { Pagination } from '../../components/common/Pagination';
import { supabase } from '../../supabaseClient';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; }> = ({ title, value, icon }) => (
    <div className="card !p-4">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <i className={`fas ${icon} fa-lg`}></i>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const ExpandedDetails: React.FC<{ transaction: Transaction, opType?: OperationType }> = ({ transaction, opType }) => {
    const fields = opType?.fields || [];
    
    return (
        <div className="bg-slate-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <h5 className="font-semibold text-gray-700 mb-2">Détails de la Transaction</h5>
                <div className="text-sm space-y-1">
                    {fields.map((field: any) => (
                        <div key={field.id} className="flex justify-between">
                            <span className="text-gray-600">{field.label}:</span>
                            <span className="font-medium text-gray-800">{(transaction.data as any)[field.name] || 'N/A'}</span>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <h5 className="font-semibold text-gray-700 mb-2">Détails Financiers</h5>
                 <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-gray-600">Montant Principal:</span><span className="font-medium text-gray-800">{formatAmount(transaction.montant_principal)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Frais:</span><span className="font-medium text-gray-800">{formatAmount(transaction.frais)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Débité:</span><span className="font-bold text-red-600">{formatAmount(transaction.montant_total)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Commission Générée:</span><span className="font-bold text-green-600">{formatAmount(transaction.commission_generee)}</span></div>
                </div>
            </div>
            {transaction.motif_rejet && (
                <div className="md:col-span-2 mt-2">
                    <h5 className="font-semibold text-red-700 mb-1">Motif du Rejet</h5>
                    <p className="text-sm p-2 bg-red-100 text-red-800 rounded-md">{transaction.motif_rejet}</p>
                </div>
            )}
        </div>
    );
}

export const ChefAgenceHistory: React.FC<PageComponentProps> = ({ user, handleAction }) => {
    const chefUser = user as ChefAgence;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [myAgents, setMyAgents] = useState<Agent[]>([]);
    const [opTypes, setOpTypes] = useState<OperationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ agentId: 'all', opTypeId: 'all', status: 'all', searchTerm: '' });
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchData = async () => {
            if (!chefUser.agency_id) { setLoading(false); return; }
            setLoading(true);

            const { data: agentsData, error: agentsError } = await supabase
                .from('profiles')
                .select('id, name, email, role, agency_id, avatar_seed, solde, status, suspension_reason')
                .eq('agency_id', chefUser.agency_id)
                .eq('role', 'agent');

            if (agentsError) { console.error(agentsError); setLoading(false); return; }
            setMyAgents((agentsData as unknown as Agent[]) || []);

            const agentIds = (agentsData || []).map((a: any) => a.id);
            agentIds.push(chefUser.id);

            const { data: txsData, error: txsError } = await supabase
                .from('transactions')
                .select('id, agent_id, op_type_id, data, montant_principal, frais, montant_total, status, proof_url, commission_generee, validateur_id, motif_rejet, created_at, assigned_to')
                .in('agent_id', agentIds)
                .order('created_at', { ascending: false });

            const { data: opTypesData, error: opTypesError } = await supabase.from('operation_types').select('id, name, description, impacts_balance, proof_is_required, status, fields, commission_config');
            
            if (txsError || opTypesError) {
                console.error(txsError || opTypesError)
            } else {
                setTransactions((txsData as unknown as Transaction[]) || []);
                const loadedOpTypes = ((opTypesData || []) as any[]).map(op => ({
                    ...op,
                    fields: (op.fields as FormField[] | null) || [],
                    commission_config: (op.commission_config as CommissionConfig | null) || {type: 'none'}
                }));
                setOpTypes(loadedOpTypes);
            }
            setLoading(false);
        };
        fetchData();
    }, [chefUser.id, chefUser.agency_id]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const agent = myAgents.find(a => a.id === t.agent_id) || (t.agent_id === chefUser.id ? chefUser : null);
            const opType = opTypes.find(ot => ot.id === t.op_type_id);
            
            const matchesAgent = filters.agentId === 'all' || t.agent_id === filters.agentId;
            const matchesOpType = filters.opTypeId === 'all' || t.op_type_id === filters.opTypeId;
            const matchesStatus = filters.status === 'all' || t.status === filters.status;
            
            const matchesSearch = filters.searchTerm === '' ||
                t.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                (agent && agent.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
                (opType && opType.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));

            return matchesAgent && matchesOpType && matchesStatus && matchesSearch;
        });
    }, [transactions, filters, myAgents, opTypes, chefUser]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTransactions, currentPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
        setCurrentPage(1);
    };

    const handleViewProof = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        handleAction?.('viewProof', url);
    };
    
    if (loading) return <Card title="Historique Détaillé des Opérations" icon="fa-landmark"><div>Chargement...</div></Card>;

    return (
        <Card title="Historique Détaillé des Opérations" icon="fa-landmark">
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Date</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                            <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                         {paginatedTransactions.length === 0 ? (
                            <tr><td colSpan={7} className="text-center text-gray-500 py-10">Aucune transaction à afficher.</td></tr>
                        ) : (
                            paginatedTransactions.map(t => {
                                const opType = opTypes.find(ot => ot.id === t.op_type_id);
                                const agent = myAgents.find(a => a.id === t.agent_id) || (t.agent_id === chefUser.id ? chefUser : null);
                                return (
                                    <React.Fragment key={t.id}>
                                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRowId(prevId => prevId === t.id ? null : t.id)}>
                                            <td className="p-3 text-center"><i className={`fas fa-chevron-right text-gray-400 transition-transform ${expandedRowId === t.id ? 'rotate-90' : ''}`}></i></td>
                                            <td className="p-3"><p className="font-mono text-xs text-gray-800 font-semibold">{t.id}</p><p className="text-xs text-gray-500">{formatDate(t.created_at)}</p></td>
                                            <td className="p-3 font-medium text-gray-900">{agent?.name || 'N/A'}</td>
                                            <td className="p-3 text-sm text-gray-600">{opType ? opType.name : 'N/A'}</td>
                                            <td className="p-3 text-right font-semibold text-gray-700">{formatAmount(t.montant_principal)}</td>
                                            <td className="p-3 text-center"><span className={`badge ${getBadgeClass(t.status)}`}>{t.status}</span></td>
                                            <td className="p-3 text-center">
                                                 {t.proof_url ? (<button className="btn btn-xs btn-outline-secondary !py-1 !px-2" onClick={(e) => handleViewProof(e, t.proof_url!)} title="Voir la preuve"><i className="fas fa-eye"></i></button>) : (<span className="text-gray-400 text-xs">N/A</span>)}
                                            </td>
                                        </tr>
                                        {expandedRowId === t.id && (
                                            <tr className="bg-slate-50"><td colSpan={7} className="p-0"><ExpandedDetails transaction={t} opType={opType} /></td></tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                         )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)} onPageChange={setCurrentPage} />
        </Card>
    );
};
