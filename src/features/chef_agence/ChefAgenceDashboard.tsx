







import React, { useState, useEffect } from 'react';
import { PageComponentProps, ChefAgence } from '../../types';
import { formatAmount } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';
import { PageHeader } from '../../components/common/PageHeader';

const StatCard: React.FC<{ title: string; value: string | number; icon: string, className?: string, iconBgColor?: string }> = ({ title, value, icon, className, iconBgColor = 'bg-blue-100 dark:bg-blue-900/50' }) => (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 flex items-center transition-all duration-300 hover:shadow-xl hover:scale-105 ${className}`}>
        <div className={`p-3 rounded-lg ${iconBgColor} text-blue-600 dark:text-blue-300 mr-4`}>
            <i className={`fas ${icon} fa-lg`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


export const ChefAgenceDashboard: React.FC<PageComponentProps> = ({ user, navigateTo, handleAction, refreshKey }) => {
    const chefUser = user as ChefAgence;
    const [stats, setStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_chef_dashboard_stats', { p_chef_id: user.id });
            if (error) {
                console.error("Error fetching chef dashboard stats:", error);
                setLoading(false);
            } else {
                setStats(data);
                setLoading(false);
            }
        };
        fetchStats();
    }, [user.id, refreshKey]);


    if (loading || !stats) return <div>Chargement du tableau de bord...</div>;
    
    return (
        <>
            <PageHeader
                title={`Tableau de Bord, ${user.name}`}
                subtitle="Vue d'ensemble de votre activité et de celle de votre agence."
                icon="fa-chart-line"
                gradient="from-blue-600 to-cyan-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard title="Mon Solde Actuel" value={formatAmount(chefUser.solde)} icon="fa-wallet" />
                <StatCard title="Mes Commissions Dues" value={formatAmount(stats.commissions_dues)} icon="fa-coins" iconBgColor="bg-purple-100 dark:bg-purple-900/50" />
                <StatCard title="Agents Actifs" value={stats.agents_actifs || 0} icon="fa-users" />
                <StatCard title="Volume Agence (Mois)" value={formatAmount(stats.volume_agence_mois)} icon="fa-chart-bar" />
                <StatCard title="Commissions Agence (Mois)" value={formatAmount(stats.commissions_agence_mois)} icon="fa-chart-pie" />
                 <StatCard title="Recharges à Approuver" value={stats.pending_recharge_count || 0} icon="fa-hourglass-half" iconBgColor="bg-orange-100 dark:bg-orange-900/50" />
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                 <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><i className="fas fa-bolt mr-3 text-blue-500"></i>Actions Rapides</h3>
                <div className="flex flex-wrap gap-3">
                    <button className="flex-1 min-w-[180px] font-semibold text-white px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => handleAction('openNewOperationModal')}><i className="fas fa-plus-circle mr-2"></i>Nouvelle Opération</button>
                    <button className="flex-1 min-w-[180px] font-semibold text-white px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => navigateTo('Gérer mes Agents')}><i className="fas fa-users-cog mr-2"></i>Gérer mes Agents</button>
                    <button className="flex-1 min-w-[180px] font-semibold text-white px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => handleAction('openTransferCommissionsModal')}><i className="fas fa-exchange-alt mr-2"></i>Virer mes Commissions</button>
                    <button className="flex-1 min-w-[180px] font-semibold text-gray-700 dark:text-gray-200 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => navigateTo('Recharges Agents')}><i className="fas fa-wallet mr-2"></i>Voir Demandes Recharge</button>
                </div>
            </div>
        </>
    );
};
