
import React from 'react';
import { PageComponentProps, SousAdmin } from '../../types';
import { Card } from '../../components/common/Card';
import { mockTransactions, mockAgencies, users, mockAuditLogs } from '../../data';
import { formatAmount, timeAgo } from '../../utils/formatters';

// A small component for stats with icons
const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className="card p-4 flex items-start">
        <div className={`p-3 rounded-lg mr-4 bg-opacity-10 ${color.replace('text', 'bg').replace('-500', '-100')}`}>
            <i className={`fas ${icon} fa-lg ${color}`}></i>
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// A component for workload display
const WorkloadItem: React.FC<{ name: string; taskCount: number; avatar_seed: string | null }> = ({ name, taskCount, avatar_seed }) => (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
        <div className="flex items-center">
            <img src={`https://placehold.co/32x32/E2E8F0/4A5568?text=${avatar_seed}`} alt={name} className="w-8 h-8 rounded-full mr-3"/>
            <span className="font-medium text-gray-700">{name}</span>
        </div>
        <div className="text-right">
            <span className="font-bold text-lg text-blue-600">{taskCount}</span>
            <span className="text-sm text-gray-500"> tâches</span>
        </div>
    </div>
);


export const AdminGeneralDashboard: React.FC<PageComponentProps> = ({ navigateTo }) => {
    // --- Data Calculation ---
    const pendingValidations = mockTransactions.filter(t => t.status.toLowerCase().includes('en attente') || t.status.toLowerCase().includes('assignée')).length;
    
    const totalVolume = mockTransactions.reduce((acc, t) => acc + t.montant_principal, 0);
    const totalUsers = Object.keys(users).length;
    
    const validatedTx = mockTransactions.filter(t => t.status === 'Validé').length;
    const rejectedTx = mockTransactions.filter(t => t.status === 'Rejeté').length;
    const successRate = (validatedTx + rejectedTx > 0) ? ((validatedTx / (validatedTx + rejectedTx)) * 100).toFixed(1) + '%' : 'N/A';
    
    const sousAdmins = Object.values(users).filter((u): u is SousAdmin => u.role === 'sous_admin');
    
    const workload = sousAdmins.map(sa => {
        const assignedTransactions = mockTransactions.filter(t => t.assigned_to === sa.id).length;
        return {
            ...sa,
            taskCount: assignedTransactions,
        };
    });

    const recentActivities = mockAuditLogs.slice(0, 4);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                    <StatCard title="Volume d'affaires (Total)" value={formatAmount(totalVolume)} icon="fa-chart-line" color="text-green-500" />
                    <StatCard title="Taux de Succès (Transactions)" value={successRate} icon="fa-check-circle" color="text-blue-500" />
                    <StatCard title="Utilisateurs Actifs" value={totalUsers} icon="fa-users" color="text-indigo-500" />
                    <StatCard title="Agences Actives" value={mockAgencies.length} icon="fa-building" color="text-purple-500" />
                </div>

                {/* Priority Tasks */}
                <Card title="Tâches Prioritaires" icon="fa-exclamation-triangle">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-yellow-800">Validations de Transactions en Attente</p>
                                <p className="text-sm text-yellow-600">Des opérations initiées par les agents nécessitent une revue.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-yellow-800">{pendingValidations}</p>
                                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Validation Transactions'); }} className="text-blue-600 hover:underline text-sm font-semibold">Traiter</a>
                            </div>
                        </div>
                    </div>
                </Card>

                 {/* Quick Actions */}
                 <Card title="Accès Rapides" icon="fa-cogs">
                    <div className="flex flex-wrap gap-3">
                        <button className="btn btn-primary" onClick={() => navigateTo('Gestion des Agences')}><i className="fas fa-building mr-2"></i>Agences</button>
                        <button className="btn btn-secondary" onClick={() => navigateTo('Gestion Sous-Admins')}><i className="fas fa-user-shield mr-2"></i>Sous-Admins</button>
                        <button className="btn btn-info text-white" onClick={() => navigateTo('Attribution Services Agences')}><i className="fas fa-store-alt-slash mr-2"></i>Services</button>
                        <button className="btn btn-outline-secondary" onClick={() => navigateTo('Journal d\'Audit')}><i className="fas fa-clipboard-list mr-2"></i>Journal d'Audit</button>
                    </div>
                 </Card>
            </div>
            
            {/* Side Column (1/3 width) */}
            <div className="lg:col-span-1 space-y-6">
                <Card title="Charge de Travail" icon="fa-users-cog">
                     <div className="space-y-2">
                         {workload.map(sa => <WorkloadItem key={sa.id} name={sa.name} taskCount={sa.taskCount} avatar_seed={sa.avatar_seed} />)}
                         {workload.length === 0 && <p className="text-center text-gray-500 italic p-4">Aucun sous-administrateur à afficher.</p>}
                     </div>
                </Card>
                <Card title="Activité Récente" icon="fa-history">
                    <div className="space-y-4">
                       {recentActivities.map(log => (
                           <div key={log.timestamp} className="flex items-start text-sm">
                               <i className="fas fa-history text-gray-400 mr-3 mt-1"></i>
                               <div>
                                   <p className="text-gray-800" dangerouslySetInnerHTML={{__html: `<strong>${log.user}</strong> a effectué : ${log.action} sur <strong>${log.entity}</strong>`}}></p>
                                   <p className="text-xs text-gray-500">{timeAgo(log.timestamp)}</p>
                               </div>
                           </div>
                       ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
