
import React, { useState, useEffect } from 'react';
import { PageComponentProps, Agent, Transaction, OperationType, CommissionConfig, FormField } from '../../types';
import { formatAmount, timeAgo } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';

const StatCard: React.FC<{ title: string; value: string | number; icon: string, className?: string }> = ({ title, value, icon, className }) => (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 flex items-center transition-all duration-300 hover:shadow-xl hover:scale-105 ${className}`}>
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mr-4">
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
        const name = opType?.name || '';
        if (name.includes('Transfert')) return 'fa-exchange-alt';
        if (name.includes('Paiement')) return 'fa-file-invoice-dollar';
        if (name.includes('abonnement')) return 'fa-tv';
        return 'fa-receipt';
    };

    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200">
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
                <p className={`font-bold ${opType?.impacts_balance ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                    {opType?.impacts_balance ? '-' : '+'} {formatAmount(transaction.montant_principal)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(transaction.created_at)}</p>
            </div>
        </div>
    );
};

export const AgentDashboard: React.FC<PageComponentProps> = ({ user, navigateTo, handleAction, refreshKey }) => {
    const agentUser = user as Agent;
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [opTypes, setOpTypes] = useState<OperationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ transactionsThisMonth: 0, commissionsMoisEstimees: 0 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const [statsRes, trxRes, opTypesRes] = await Promise.all([
                supabase.rpc('get_agent_dashboard_stats', { p_agent_id: agentUser.id }),
                supabase.from('transactions').select('id, created_at, agent_id, op_type_id, data, montant_principal, frais, montant_total, status, proof_url, commission_generee, validateur_id, motif_rejet, assigned_to').eq('agent_id', agentUser.id).order('created_at', { ascending: false }).limit(5),
                supabase.from('operation_types').select('id, name, description, impacts_balance, proof_is_required, status, fields, commission_config')
            ]);
            
            if (statsRes.error || trxRes.error || opTypesRes.error) {
                console.error({ statsError: statsRes.error, trxError: trxRes.error, opTypesError: opTypesRes.error });
            } else {
                const statsData = statsRes.data as any;
                 setStats({
                    transactionsThisMonth: statsData.transactions_this_month || 0,
                    commissionsMoisEstimees: statsData.commissions_mois_estimees || 0,
                });

                setRecentTransactions((trxRes.data as unknown as Transaction[]) || []);
                
                const loadedOpTypes = ((opTypesRes.data || []) as any[]).map(op => ({
                    ...op,
                    fields: (op.fields as FormField[] | null) || [],
                    commission_config: (op.commission_config as CommissionConfig | null) || {type: 'none'}
                }));
                setOpTypes(loadedOpTypes);
            }
            setLoading(false);
        };
        fetchData();
    }, [agentUser.id, refreshKey]);

    const commissionGoal = 15000;
    const commissionProgress = Math.min(((stats.commissionsMoisEstimees || 0) / commissionGoal) * 100, 100);

    if (loading) return <div>Chargement du tableau de bord...</div>;

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Solde Actuel" value={formatAmount(agentUser.solde)} icon="fa-wallet" />
                    <StatCard title="Transactions (Mois)" value={stats.transactionsThisMonth} icon="fa-chart-bar" />
                    <StatCard title="Commissions Dues" value={formatAmount(agentUser.commissions_dues)} icon="fa-coins" />
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                            <i className="fas fa-history mr-3 text-blue-500"></i>Activité Récente
                        </h3>
                         <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Historique Opérations'); }} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold">
                            Voir tout <i className="fas fa-arrow-right text-xs"></i>
                         </a>
                     </div>
                     <div className="space-y-2">
                        {recentTransactions.length > 0 ? 
                            recentTransactions.map(op => <TransactionListItem key={op.id} transaction={op} opType={opTypes.find(ot => ot.id === op.op_type_id)} />) :
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Aucune transaction récente.</p>
                        }
                     </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                        <i className="fas fa-bolt mr-3 text-blue-500"></i>Actions Rapides
                    </h3>
                    <div className="flex flex-col space-y-3">
                        <button className="w-full text-left p-3 flex items-center font-semibold text-white px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg" onClick={() => handleAction('openNewOperationModal')}>
                            <i className="fas fa-plus-circle fa-fw mr-3"></i>Initier une Opération
                        </button>
                        <button className="w-full text-left p-3 flex items-center font-semibold text-white px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg" onClick={() => handleAction('openRechargeModal')}>
                            <i className="fas fa-hand-holding-usd fa-fw mr-3"></i>Demander une Recharge
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                        <i className="fas fa-chart-pie mr-3 text-blue-500"></i>Performances (Mois)
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Commissions estimées:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{formatAmount(stats.commissionsMoisEstimees || 0)}</span>
                        </div>
                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style={{width: `${commissionProgress}%`}}></div>
                        </div>
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">Objectif: {formatAmount(commissionGoal)}</p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};