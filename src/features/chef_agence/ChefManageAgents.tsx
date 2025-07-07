

import React, { useState, useMemo } from 'react';
import { PageComponentProps, ChefAgence, Agent } from '../../types';
import { Card } from '../../components/common/Card';
import { users } from '../../data';
import { formatAmount } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="card p-4">
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

const AgentCardComponent: React.FC<{ agent: Agent; onAction: (action: string, data?: any) => void; }> = ({ agent, onAction }) => {
    return (
        <div className={`card flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 ${agent.status === 'suspended' ? 'bg-gray-100 opacity-75' : ''}`}>
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                        <img src={`https://placehold.co/48x48/E2E8F0/4A5568?text=${agent.avatar_seed}`} alt={agent.name} className="w-12 h-12 rounded-full mr-4"/>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800">{agent.name}</h4>
                            <p className="text-sm text-gray-500">{agent.email}</p>
                        </div>
                    </div>
                    <span className={`badge ${agent.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{agent.status === 'active' ? 'Actif' : 'Suspendu'}</span>
                </div>
                
                <div className="my-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Solde actuel</p>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(agent.solde)}</p>
                </div>

                <div className="my-4 grid grid-cols-1 gap-4 text-sm">
                     <div className="text-center">
                        <p className="text-gray-500">Transactions (mois)</p>
                        <p className="font-semibold text-lg">{agent.transactions_this_month}</p>
                    </div>
                </div>
                {agent.status === 'suspended' && agent.suspension_reason &&
                    <div className="text-xs text-red-700 bg-red-100 p-2 rounded-md">
                        <strong>Motif:</strong> {agent.suspension_reason}
                    </div>
                }
            </div>
            <div className="pt-4 border-t flex items-center justify-end flex-wrap gap-2">
                <button className="btn btn-sm btn-info text-white" onClick={() => onAction('openCreateEditAgentModal', agent)}><i className="fas fa-edit mr-1"></i> Modifier</button>
                <button className="btn btn-sm btn-success" onClick={() => onAction('openRechargeAgentModal', agent)}><i className="fas fa-wallet mr-1"></i> Recharger</button>
                <button className={`btn btn-sm ${agent.status === 'active' ? 'btn-warning text-white' : 'btn-secondary'}`} onClick={() => onAction('openSuspendAgentModal', agent)}>
                    <i className={`fas ${agent.status === 'active' ? 'fa-ban' : 'fa-check-circle'} mr-1`}></i> {agent.status === 'active' ? 'Suspendre' : 'Activer'}
                </button>
            </div>
        </div>
    );
};


export const ChefManageAgents: React.FC<PageComponentProps> = ({ user, handleAction }) => {
    const chefUser = user as ChefAgence;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const myAgents = useMemo(() =>
        Object.values(users).filter((u): u is Agent => 
            u.role === 'agent' && u.agency_id === chefUser.agency_id
        ), [users, chefUser.agency_id]);

    const filteredAgents = useMemo(() => {
        return myAgents.filter(agent => {
            const matchesSearch = searchTerm === '' || 
                                  agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  agent.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, myAgents]);

    const agencyStats = useMemo(() => {
        const totalBalance = myAgents.reduce((acc, agent) => acc + (agent.solde || 0), 0);
        return {
            agentCount: myAgents.length,
            totalBalance,
        };
    }, [myAgents]);
    
    const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
    const paginatedAgents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAgents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAgents, currentPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSearchTerm((e.target as HTMLInputElement).value || '');
        setStatusFilter((e.target as HTMLSelectElement).value || 'all');
        setCurrentPage(1);
    }


    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <StatCard title="Nombre d'Agents" value={agencyStats.agentCount} icon="fa-users" />
                <StatCard title="Solde Total des Agents" value={formatAmount(agencyStats.totalBalance)} icon="fa-wallet" />
            </div>

            <Card title="Gestion de Mes Agents" icon="fa-users-cog">
                 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-grow">
                        <div className="relative flex-grow max-w-xs">
                             <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                             <input
                                type="text"
                                placeholder="Rechercher par nom..."
                                className="form-input pl-10"
                                value={searchTerm}
                                onChange={handleFilterChange}
                             />
                        </div>
                        <select
                            className="form-select max-w-xs"
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actif</option>
                            <option value="suspended">Suspendu</option>
                        </select>
                    </div>
                    <button className="btn btn-success" onClick={() => handleAction('openCreateEditAgentModal', null)}>
                        <i className="fas fa-user-plus mr-2"></i>Créer un Compte Agent
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedAgents.map(agent => (
                        <AgentCardComponent key={agent.id} agent={agent} onAction={handleAction} />
                    ))}
                </div>
                {filteredAgents.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <i className="fas fa-user-slash fa-2x mb-3 text-gray-400"></i>
                        <p>Aucun agent ne correspond à vos critères.</p>
                    </div>
                )}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </Card>
        </>
    );
};
