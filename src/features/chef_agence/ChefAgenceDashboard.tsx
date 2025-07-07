




import React, { useState, useEffect } from 'react';
import { PageComponentProps, ChefAgence, Agency, AgentRechargeRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { formatAmount } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';

const StatCard: React.FC<{ title: string; value: string | number; icon: string, className?: string }> = ({ title, value, icon, className }) => (
    <div className={`card p-4 flex items-center ${className}`}>
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mr-4">
            <i className={`fas ${icon} fa-lg`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


export const ChefAgenceDashboard: React.FC<PageComponentProps> = ({ user, navigateTo, handleAction }) => {
    const chefUser = user as ChefAgence;
    const [agency, setAgency] = useState<Agency | null>(null);
    const [pendingRechargeCount, setPendingRechargeCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!chefUser.agency_id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const { data: agencyData, error: agencyError } = await supabase
                .from('agencies')
                .select('id, name, chef_id')
                .eq('id', chefUser.agency_id)
                .single();
            
            const { count, error: rechargeError } = await supabase
                .from('agent_recharge_requests')
                .select('id', { count: 'exact', head: true })
                .eq('chef_agence_id', chefUser.id)
                .eq('status', 'En attente Chef Agence');

            if (agencyError) {
                console.error(agencyError);
            } else {
                setAgency(agencyData as Agency | null);
            }

            if (rechargeError) {
                console.error(rechargeError);
            } else {
                setPendingRechargeCount(count || 0);
            }
            setLoading(false);
        };
        fetchData();
    }, [chefUser.id, chefUser.agency_id]);


    if (loading) return <div>Chargement...</div>;
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard title="Mon Solde Actuel" value={formatAmount(chefUser.solde)} icon="fa-wallet" />
                <StatCard title="Mes Commissions Dues" value={formatAmount(chefUser.commissions_perso_dues)} icon="fa-coins" />
                <StatCard title="Agents Actifs" value={chefUser.agents_actifs || 0} icon="fa-users" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard title="Volume Trans. Agence (Mois)" value={formatAmount(chefUser.volume_agence_mois)} icon="fa-chart-bar" />
                <StatCard title="Commissions Agence (Mois)" value={formatAmount(chefUser.commissions_agence_mois)} icon="fa-chart-pie" />
            </div>
            <Card title="Actions Rapides" icon="fa-bolt">
                 <p className="text-orange-600 mb-3"><i className="fas fa-exclamation-triangle mr-2"></i>Demandes de Recharge Agents en Attente : <span className="font-bold">{pendingRechargeCount}</span> {pendingRechargeCount > 0 ? <a href="#" onClick={() => navigateTo('Recharges Agents')} className="text-blue-600 hover:underline ml-2">Gérer</a> : ''}</p>
                <div className="flex flex-wrap gap-3">
                    <button className="btn btn-primary" onClick={() => handleAction('openNewOperationModal')}><i className="fas fa-plus-circle mr-2"></i>Nouvelle Opération</button>
                    <button className="btn btn-secondary" onClick={() => navigateTo('Gérer mes Agents')}><i className="fas fa-users-cog mr-2"></i>Gérer mes Agents</button>
                </div>
            </Card>
        </>
    );
};
