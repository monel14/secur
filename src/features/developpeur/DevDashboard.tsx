import React from 'react';
import { PageComponentProps } from '../../types';
import { Card } from '../../components/common/Card';
import { mockOperationTypes, mockAgencies, users, mockErrorLogs, mockAuditLogs } from '../../data';
import { timeAgo, formatDate } from '../../utils/formatters';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="card p-4 flex items-center">
        <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
            <i className={`fas ${icon} fa-lg text-white`}></i>
        </div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


export const DevDashboard: React.FC<PageComponentProps> = ({ navigateTo }) => {
    const totalOpTypes = mockOperationTypes.length;
    const totalAgencies = mockAgencies.length;
    const totalUsers = Object.keys(users).length;
    const errorsLast24h = mockErrorLogs.filter(log => new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
    const lastError = mockErrorLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const recentActivity = mockAuditLogs.filter(log => log.role === 'Développeur' || log.action.toLowerCase().includes('opération')).slice(0, 4);
    
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Types d'Opération" value={totalOpTypes} icon="fa-cogs" colorClass="bg-blue-500" />
                <StatCard title="Agences Actives" value={totalAgencies} icon="fa-building" colorClass="bg-green-500" />
                <StatCard title="Utilisateurs" value={totalUsers} icon="fa-users" colorClass="bg-indigo-500" />
                <StatCard title="Erreurs (24h)" value={errorsLast24h} icon="fa-bug" colorClass={errorsLast24h > 0 ? "bg-red-500" : "bg-gray-500"} />
            </div>

            <Card title="Accès Rapide" icon="fa-bolt">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="btn btn-primary text-left p-4 h-full" onClick={() => navigateTo('Types d\'Opérations')}>
                        <div className="flex items-center"><i className="fas fa-cogs fa-lg mr-3"></i>
                        <div><span className="font-semibold">Gestion des Opérations</span><br/><span className="text-sm opacity-80">Configurer les services</span></div></div>
                    </button>
                    <button className="btn btn-secondary text-left p-4 h-full" onClick={() => navigateTo('Configuration Globale')}>
                         <div className="flex items-center"><i className="fas fa-tools fa-lg mr-3"></i>
                        <div><span className="font-semibold">Configuration Globale</span><br/><span className="text-sm opacity-80">Paramètres système</span></div></div>
                    </button>
                    <button className="btn btn-warning text-left p-4 h-full" onClick={() => navigateTo('Journaux d\'Erreurs')}>
                         <div className="flex items-center"><i className="fas fa-bug fa-lg mr-3"></i>
                        <div><span className="font-semibold">Journaux d'Erreurs</span><br/><span className="text-sm opacity-80">Surveiller les problèmes</span></div></div>
                    </button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Santé du Système" icon="fa-heartbeat">
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex justify-between items-center"><span>Statut de l'API principale:</span><span className="font-semibold flex items-center"><i className="fas fa-check-circle text-green-500 mr-2"></i>Opérationnel</span></li>
                        <li className="flex justify-between items-center"><span>Connectivité Base de Données:</span><span className="font-semibold flex items-center"><i className="fas fa-check-circle text-green-500 mr-2"></i>Connecté</span></li>
                        <li className="flex justify-between items-center"><span>Dernière Erreur Enregistrée:</span><span className={`font-semibold ${lastError ? 'text-red-600' : 'text-gray-500'}`}>{lastError ? timeAgo(lastError.timestamp) : 'Aucune'}</span></li>
                        <li className="flex justify-between items-center"><span>Déploiements en Attente:</span><span className="font-semibold text-gray-500">Aucun</span></li>
                        <li className="flex justify-between items-center"><span>Version Actuelle:</span><span className="font-semibold text-gray-500">v2.1.3</span></li>
                    </ul>
                </Card>

                <Card title="Activité Récente Pertinente" icon="fa-history">
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? recentActivity.map(log => (
                             <div key={log.timestamp} className="flex items-start text-sm">
                                <i className="fas fa-info-circle text-blue-400 mr-3 mt-1"></i>
                                <div>
                                    <p className="text-gray-800">
                                        <span className="font-semibold">{log.user}</span> a effectué : <span className="font-medium">{log.action}</span> sur <span className="font-medium">{log.entity}</span>.
                                    </p>
                                    <p className="text-xs text-gray-500">{timeAgo(log.timestamp)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 italic">Aucune activité récente à afficher.</p>
                        )}
                    </div>
                     <div className="mt-4 text-right">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Journal d\'Audit'); }} className="text-blue-600 hover:underline text-sm">
                            Voir tout le journal d'audit <i className="fas fa-arrow-right text-xs"></i>
                        </a>
                    </div>
                </Card>
            </div>
        </>
    );
};
