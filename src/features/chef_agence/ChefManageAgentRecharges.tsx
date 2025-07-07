

import React, { useState, useMemo } from 'react';
import { PageComponentProps, ChefAgence, Agent, AgentRechargeRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { users, mockAgentRechargeRequests } from '../../data';
import { formatAmount, formatDate, timeAgo } from '../../utils/formatters';
import { getBadgeClass } from '../../utils/uiHelpers';
import { Pagination } from '../../components/common/Pagination';

// Sub-component for pending request cards
const PendingRequestCard: React.FC<{
    request: AgentRechargeRequest;
    agent: Agent | undefined;
    onAction: (action: string, data: any) => void;
}> = ({ request, agent, onAction }) => {
    if (!agent) return null;

    const openApproveModal = () => {
        onAction('openApproveRechargeModal', { request, agent });
    };

    const openRejectModal = () => {
        onAction('openRejectRechargeModal', request);
    };

    return (
        <div className="card !p-0 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
            <div className="p-4">
                <div className="flex items-center mb-3">
                    <img src={`https://placehold.co/40x40/E2E8F0/4A5568?text=${agent.avatar_seed}`} alt={agent.name} className="w-10 h-10 rounded-full mr-3"/>
                    <div>
                        <p className="font-bold text-gray-800">{agent.name}</p>
                        <p className="text-xs text-gray-500">{timeAgo(request.created_at)}</p>
                    </div>
                </div>
                <div className="text-center my-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Montant demandé</p>
                    <p className="text-3xl font-bold text-blue-600">{formatAmount(request.amount)}</p>
                </div>
                {request.motif && (
                    <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
                        <i className="fas fa-quote-left fa-xs mr-1"></i>
                        {request.motif}
                        <i className="fas fa-quote-right fa-xs ml-1"></i>
                    </p>
                )}
                 <div className="mt-3 text-center text-xs text-gray-500">
                    Solde actuel de l'agent: <span className="font-semibold">{formatAmount(agent.solde)}</span>
                 </div>
            </div>
            <div className="p-3 bg-gray-50 border-t flex items-center justify-end gap-2">
                <button className="btn btn-sm btn-danger" title="Rejeter" onClick={openRejectModal}>
                    <i className="fas fa-times mr-1"></i> Rejeter
                </button>
                <button className="btn btn-sm btn-success" title="Approuver" onClick={openApproveModal}>
                    <i className="fas fa-check mr-1"></i> Approuver
                </button>
            </div>
        </div>
    );
}

// Main component
export const ChefManageAgentRecharges: React.FC<PageComponentProps> = ({ user, handleAction }) => {
    const chefUser = user as ChefAgence;
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingPage, setPendingPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const PENDING_ITEMS_PER_PAGE = 6;
    const HISTORY_ITEMS_PER_PAGE = 10;

    const { pendingRecharges, historyRecharges } = useMemo(() => {
        const allRecharges = [...mockAgentRechargeRequests] // Create a mutable copy
            .filter(r => r.chef_agence_id === chefUser.id)
            .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
        const pending = allRecharges.filter(r => r.status === 'En attente Chef Agence');
        const history = allRecharges.filter(r => r.status !== 'En attente Chef Agence');
        return { pendingRecharges: pending, historyRecharges: history };
    }, [mockAgentRechargeRequests, chefUser.id]);
    
    // Pagination for Pending Tab
    const totalPendingPages = Math.ceil(pendingRecharges.length / PENDING_ITEMS_PER_PAGE);
    const paginatedPending = useMemo(() => {
        const startIndex = (pendingPage - 1) * PENDING_ITEMS_PER_PAGE;
        return pendingRecharges.slice(startIndex, startIndex + PENDING_ITEMS_PER_PAGE);
    }, [pendingRecharges, pendingPage]);

    // Pagination for History Tab
    const totalHistoryPages = Math.ceil(historyRecharges.length / HISTORY_ITEMS_PER_PAGE);
    const paginatedHistory = useMemo(() => {
        const startIndex = (historyPage - 1) * HISTORY_ITEMS_PER_PAGE;
        return historyRecharges.slice(startIndex, startIndex + HISTORY_ITEMS_PER_PAGE);
    }, [historyRecharges, historyPage]);


    const renderHistoryTable = () => {
        const headers = ['Date Traitement', 'Agent', 'Montant', 'Statut', 'Motif/Raison'];
        const rows = paginatedHistory.map(req => {
            const agent = users[req.agent_id] as Agent;
            return [
                formatDate(req.processing_date),
                agent?.name || 'N/A',
                formatAmount(req.amount),
                `<span class="badge ${getBadgeClass(req.status)}">${req.status}</span>`,
                req.status === 'Rejetée' ? req.rejection_reason : (req.motif || '-')
            ];
        });

        return (
            <div className="mt-4">
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full table table-sm">
                        <thead><tr>{headers.map(h => <th key={h} className="!p-3">{h}</th>)}</tr></thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((row, i) => (
                                    <tr key={i}>{row.map((cell, j) => <td key={j} className="!p-3" dangerouslySetInnerHTML={{__html: cell?.toString() || '-'}}></td>)}</tr>
                                ))
                            ) : (
                                <tr><td colSpan={headers.length} className="text-center text-gray-500 py-6">Aucun historique de demande.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={historyPage} totalPages={totalHistoryPages} onPageChange={setHistoryPage} />
            </div>
        );
    };

    const renderPendingGrid = () => (
        <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPending.map(req => {
                    const agent = Object.values(users).find(u => u.id === req.agent_id) as Agent | undefined;
                    return <PendingRequestCard key={req.id} request={req} agent={agent} onAction={handleAction} />;
                })}
            </div>
            <Pagination currentPage={pendingPage} totalPages={totalPendingPages} onPageChange={setPendingPage} />
        </div>
    );
    
    return (
        <Card title="Demandes de Recharge des Agents" icon="fa-wallet">
             <div className="tabs">
                <button 
                    onClick={() => setActiveTab('pending')} 
                    className={activeTab === 'pending' ? 'active' : ''}
                >
                    En attente ({pendingRecharges.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')} 
                    className={activeTab === 'history' ? 'active' : ''}
                >
                    Historique ({historyRecharges.length})
                </button>
            </div>
            
             {activeTab === 'pending' ? (
                pendingRecharges.length > 0 ? renderPendingGrid() : <div className="text-center py-10 text-gray-500"><i className="fas fa-inbox fa-2x mb-3 text-gray-400"></i><p>Aucune demande en attente.</p></div>
             ) : (
                renderHistoryTable()
             )}
        </Card>
    );
};
