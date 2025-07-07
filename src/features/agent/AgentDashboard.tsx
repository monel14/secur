





import React, { useState, useEffect } from 'react';
import { PageComponentProps, Agent, Transaction, OperationType, Json, FormField, CommissionConfig } from '../../types';
import { formatAmount, timeAgo } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';

const StatCard: React.FC<{ title: string; value: string | number; icon: string, className?: string }> = ({ title, value, icon, className }) => (
    <div className={`card !p-4 flex items-center ${className}`}>
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mr-4">
            <i className={`fas ${icon} fa-lg`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const TransactionListItem: React.FC<{ transaction: Transaction, opType?: OperationType }> = ({ transaction, opType }) => {
    let details = '';
    if (transaction.data && typeof transaction.data === 'object' && transaction.data !== null && !Array.isArray(transaction.data)) {
        const dataObj = transaction.data as Record<string, any>;
        if (opType?.id === 'op_transfert_nat') details = `vers ${dataObj.nom_beneficiaire}`;
        else if (opType?.id === 'op_paiement_sde') details = `Facture ${dataObj.num_facture_sde}`;
        else if (opType?.id === 'op_reabo_canal') details = `Décodeur ${dataObj.num_decodeur_canal}`;
    }

    const getIcon = () => {
        if (opType?.name.includes('Transfert')) return 'fa-exchange-alt';
        if (opType?.name.includes('Paiement')) return 'fa-file-invoice-dollar';
        if (opType?.name.includes('abonnement')) return 'fa-tv';
        return 'fa-receipt';
    };

    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md">
            <div className="flex items-center truncate">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4 flex-shrink-0">
                    <i className={`fas ${getIcon()} text-gray-500 dark:text-gray-400`}></i>
                </div>
                <div className="truncate">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{opType?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{details}</p>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
                <p className={`font-bold ${opType?.impacts_balance ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {opType?.impacts_balance ? '-' : '+'} {formatAmount(transaction.montant_principal)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(transaction.created_at)}</p>
            </div>
        </div>
    );
};

export const AgentDashboard: React.FC<PageComponentProps> = ({ user, navigateTo, handleAction }) => {
    const agentUser = user as Agent;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [opTypes, setOpTypes] = useState<OperationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ transactionsThisMonth: 0, commissionsDues: 0, commissionsMoisEstimees: 0 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: trxData, error: trxError } = await supabase
                .from('transactions')
                .select('id, created_at, agent_id, op_type_id, data, montant_principal, frais, montant_total, status, proof_url, commission_generee, validateur_id, motif_rejet, assigned_to')
                .eq('agent_id', agentUser.id)
                .order('created_at', { ascending: false });

            const { data: opTypesData, error: opTypesError } = await supabase
                .from('operation_types')
                .select('id, name, description, impacts_balance, proof_is_required, status, fields, commission_config');

            if (trxError || opTypesError) {
                console.error(trxError || opTypesError);
            } else {
                const loadedTransactions = (trxData as unknown as Transaction[]) || [];
                setTransactions(loadedTransactions);
                
                const loadedOpTypes = ((opTypesData || []) as any[]).map(op => ({
                    ...op,
                    fields: (op.fields as FormField[] | null) || [],
                    commission_config: (op.commission_config as CommissionConfig | null) || {type: 'none'}
                }));
                setOpTypes(loadedOpTypes);
                
                // Calculate stats
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                
                const monthTxs = loadedTransactions.filter(t => new Date(t.created_at) >= startOfMonth);
                const commissionsDues = loadedTransactions.filter(t => t.status === 'Validé').reduce((sum, tx) => sum + tx.commission_generee, 0);
                const commissionsMoisEstimees = monthTxs.reduce((sum, tx) => sum + tx.commission_generee, 0);

                setStats({
                    transactionsThisMonth: monthTxs.length,
                    commissionsDues,
                    commissionsMoisEstimees
                });
            }
            setLoading(false);
        };
        fetchData();
    }, [agentUser.id]);

    const commissionGoal = 15000;
    const commissionProgress = Math.min(((stats.commissionsMoisEstimees || 0) / commissionGoal) * 100, 100);

    if (loading) return <div>Chargement du tableau de bord...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Solde Actuel" value={formatAmount(agentUser.solde)} icon="fa-wallet" />
                    <StatCard title="Transactions (Mois)" value={stats.transactionsThisMonth} icon="fa-exchange-alt" />
                    <StatCard title="Commissions Dues" value={formatAmount(stats.commissionsDues)} icon="fa-coins" />
                </div>
                
                <div className="card">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                            <i className="fas fa-history mr-3 text-blue-500"></i>Activité Récente
                        </h3>
                         <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Historique Opérations'); }} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold">
                            Voir tout <i className="fas fa-arrow-right text-xs"></i>
                         </a>
                     </div>
                     <div className="space-y-2">
                        {transactions.length > 0 ? 
                            transactions.slice(0,5).map(op => <TransactionListItem key={op.id} transaction={op} opType={opTypes.find(ot => ot.id === op.op_type_id)} />) :
                            <p className="text-center text-gray-500 py-4">Aucune transaction récente.</p>
                        }
                     </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="card">
                     <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <i className="fas fa-bolt mr-3 text-blue-500"></i>Actions Rapides
                    </h3>
                    <div className="flex flex-col space-y-3">
                        <button className="btn btn-primary w-full text-left p-3 flex items-center" onClick={() => handleAction('openNewOperationModal')}>
                            <i className="fas fa-plus-circle fa-fw mr-3"></i>Initier une Opération
                        </button>
                        <button className="btn btn-success w-full text-left p-3 flex items-center" onClick={() => handleAction('openRechargeModal')}>
                            <i className="fas fa-hand-holding-usd fa-fw mr-3"></i>Demander une Recharge
                        </button>
                    </div>
                </div>

                <div className="card">
                     <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <i className="fas fa-chart-pie mr-3 text-blue-500"></i>Performances (Mois)
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Commissions estimées:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{formatAmount(stats.commissionsMoisEstimees || 0)}</span>
                        </div>
                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${commissionProgress}%`}}></div>
                        </div>
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">Objectif: {formatAmount(commissionGoal)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
