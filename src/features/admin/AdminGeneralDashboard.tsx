
import React, { useState, useEffect } from 'react';
import { PageComponentProps, SousAdmin, AuditLog, User } from '../../types';
import { formatAmount, timeAgo } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';

import { PageHeader } from '../../components/common/PageHeader';


// A small component for stats with icons
const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 flex items-start transition-all duration-300 hover:shadow-xl hover:scale-105">
        <div className={`p-3 rounded-lg mr-4 bg-opacity-10 ${color.replace('text', 'bg').replace('-500', '-100').replace('-600', '-100')}`}>
            <i className={`fas ${icon} fa-lg ${color}`}></i>
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

// A component for workload display
const WorkloadItem: React.FC<{ name: string; taskCount: number; avatar_seed: string | null }> = ({ name, taskCount, avatar_seed }) => (
    <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        <div className="flex items-center">
            <img src={`https://placehold.co/32x32/E2E8F0/4A5568?text=${avatar_seed}`} alt={name} className="w-8 h-8 rounded-full mr-3"/>
            <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span>
        </div>
        <div className="text-right">
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{taskCount}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400"> tâches</span>
        </div>
    </div>
);

type WorkloadUser = {
    id: string;
    name: string;
    avatar_seed: string | null;
    taskCount: number;
}

interface GlobalDashboardStats {
    pending_validations: number;
    pending_requests: number;
    total_volume: number;
    total_users: number;
    total_agencies: number;
    success_rate: number | null;
    workload: WorkloadUser[];
}

export const AdminGeneralDashboard: React.FC<PageComponentProps> = ({ navigateTo, refreshKey }) => {
    const [stats, setStats] = useState({
        pendingValidations: 0,
        pendingRequests: 0,
        totalVolume: 0,
        totalUsers: 0,
        totalAgencies: 0,
        successRate: 'N/A',
        workload: [] as WorkloadUser[],
        recentActivities: [] as AuditLog[],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            const [statsRes, auditRes] = await Promise.all([
                 supabase.rpc('get_global_dashboard_stats'),
                 supabase.from('audit_logs').select('user_id, action, entity_type, entity_id, timestamp, details, user_role').order('timestamp', { ascending: false }).limit(4)
            ]);

            if (statsRes.error || auditRes.error) {
                console.error("Error fetching dashboard data:", { statsError: statsRes.error, auditError: auditRes.error });
                setLoading(false);
                return;
            }

            const statsData = statsRes.data as unknown as GlobalDashboardStats;
            const auditData = auditRes.data || [];

            const userIds = [...new Set(auditData.map(log => log.user_id).filter(Boolean))] as string[];
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('id, name')
                .in('id', userIds);
            
            const userMap = (usersData || []).reduce((acc: Record<string, string>, user: User) => {
                acc[user.id] = user.name;
                return acc;
            }, {});

            const recentActivities = auditData.map(log => ({
                timestamp: log.timestamp,
                user: log.user_id ? userMap[log.user_id] || "ID: " + log.user_id.substring(0,8) : "Système",
                role: log.user_role || "N/A",
                action: log.action,
                entity: log.entity_id || log.entity_type || "Système",
                details: log.details ? JSON.stringify(log.details) : '',
                ip: '',
            }));

            const newStats = {
                pendingValidations: statsData.pending_validations || 0,
                pendingRequests: statsData.pending_requests || 0,
                totalVolume: statsData.total_volume || 0,
                totalUsers: statsData.total_users || 0,
                totalAgencies: statsData.total_agencies || 0,
                successRate: statsData.success_rate !== null ? `${Number(statsData.success_rate).toFixed(1)}%` : 'N/A',
                workload: (statsData.workload as WorkloadUser[]) || [],
                recentActivities,
            };
            
            setStats(newStats);
            setLoading(false);
        };

        fetchData();
    }, [refreshKey]);


    if (loading) return <div>Chargement du tableau de bord...</div>;

    return (
        <>
            <PageHeader
                title="Tableau de Bord Global"
                subtitle="Vue d'ensemble de la performance et des opérations de la plateforme."
                icon="fa-globe-americas"
                gradient="from-purple-600 to-purple-700"
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                        <StatCard title="Volume d'affaires (Total)" value={formatAmount(stats.totalVolume)} icon="fa-chart-line" color="text-green-600" />
                        <StatCard title="Taux de Succès (Transactions)" value={stats.successRate} icon="fa-check-circle" color="text-blue-600" />
                        <StatCard title="Utilisateurs Actifs" value={stats.totalUsers} icon="fa-users" color="text-indigo-600" />
                        <StatCard title="Agences Actives" value={stats.totalAgencies} icon="fa-building" color="text-purple-600" />
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><i className="fas fa-exclamation-triangle mr-3 text-yellow-500"></i>Tâches Prioritaires</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">Validations en Attente</p>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Des opérations nécessitent une revue.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">{stats.pendingValidations}</p>
                                    <button onClick={(e) => { e.preventDefault(); navigateTo('Validation Transactions'); }} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm">Traiter</button>
                                </div>
                            </div>
                             <div className="flex justify-between items-center p-4 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-orange-800 dark:text-orange-300">Requêtes en Attente</p>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">Des demandes utilisateurs attendent une réponse.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">{stats.pendingRequests}</p>
                                    <button onClick={(e) => { e.preventDefault(); navigateTo('Gestion des Requêtes'); }} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-sm">Traiter</button>
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                         <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><i className="fas fa-bolt mr-3 text-blue-500"></i>Accès Rapides</h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex-1 min-w-[150px] font-semibold text-white px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md" onClick={() => navigateTo('Gestion des Agences')}><i className="fas fa-building mr-2"></i>Agences</button>
                            <button className="flex-1 min-w-[150px] font-semibold text-white px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md" onClick={() => navigateTo('Gestion Sous-Admins')}><i className="fas fa-user-shield mr-2"></i>Sous-Admins</button>
                            <button className="flex-1 min-w-[150px] font-semibold text-white px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md" onClick={() => navigateTo('Attribution Services Agences')}><i className="fas fa-store-alt-slash mr-2"></i>Services</button>
                            <button className="flex-1 min-w-[150px] font-semibold text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-md" onClick={() => navigateTo('Journal d\'Audit')}><i className="fas fa-clipboard-list mr-2"></i>Journal d'Audit</button>
                        </div>
                     </div>
                </div>
                
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><i className="fas fa-users-cog mr-3 text-blue-500"></i>Charge de Travail</h3>
                         <div className="space-y-2">
                             {stats.workload.map(sa => <WorkloadItem key={sa.id} name={sa.name} taskCount={sa.taskCount} avatar_seed={sa.avatar_seed} />)}
                             {stats.workload.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 italic p-4">Aucun sous-administrateur à afficher.</p>}
                         </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><i className="fas fa-history mr-3 text-blue-500"></i>Activité Récente</h3>
                        <div className="space-y-4">
                           {stats.recentActivities.map(log => (
                               <div key={log.timestamp} className="flex items-start text-sm">
                                   <i className="fas fa-history text-gray-400 dark:text-gray-500 mr-3 mt-1"></i>
                                   <div>
                                       <p className="text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{__html: `<strong>${log.user}</strong> a effectué : ${log.action} sur <strong>${log.entity}</strong>`}}></p>
                                       <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(log.timestamp)}</p>
                                   </div>
                               </div>
                           ))}
                           {stats.recentActivities.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 italic p-4">Aucune activité récente.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
