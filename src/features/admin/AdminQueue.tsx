





import React, { useState, useEffect } from 'react';
import { PageComponentProps, Transaction, User, Request, Agent, ChefAgence, AdminGeneral, SousAdmin, Developpeur, OperationType } from '../../types';
import { Card } from '../../components/common/Card';
import { formatDate, formatAmount } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';
import { supabase } from '../../supabaseClient';

interface AdminQueueProps extends PageComponentProps {
    title: string;
    icon: string;
    items: (Transaction | Request)[];
    description?: string;
}

type TabKey = 'unassigned' | 'assigned_to_me' | 'all';

interface UserMapValue {
    name: string;
    role: string;
    agency_id: string | null;
}
type UserMap = Record<string, UserMapValue>;
type AgencyMap = Record<string, {name: string}>;
type OpTypeMap = Record<string, {name: string, impacts_balance: boolean}>;

const getOperationIcon = (opTypeId: string): string => {
    if (opTypeId.includes('transfert')) return 'fa-exchange-alt';
    if (opTypeId.includes('sde') || opTypeId.includes('facture')) return 'fa-file-invoice-dollar';
    if (opTypeId.includes('reabo') || opTypeId.includes('canal')) return 'fa-tv';
    if (opTypeId.includes('woyofal')) return 'fa-lightbulb';
    return 'fa-receipt';
};

export const AdminQueue: React.FC<AdminQueueProps> = ({ title, icon, items, user, handleAction, description }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('unassigned');
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [currentPages, setCurrentPages] = useState({ unassigned: 1, assigned_to_me: 1, all: 1 });
    const [relatedData, setRelatedData] = useState<{users: UserMap, agencies: AgencyMap, opTypes: OpTypeMap}>({users: {}, agencies: {}, opTypes: {}});
    const isAdminGeneral = user.role === 'admin_general';
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchRelatedData = async () => {
            const { data: profiles, error: pError } = await supabase.from('profiles').select('id, name, role, agency_id');
            const { data: agencies, error: aError } = await supabase.from('agencies').select('id, name');
            const { data: opTypes, error: oError } = await supabase.from('operation_types').select('id, name, impacts_balance');

            if (pError || aError || oError) {
                console.error("Error fetching related data", { pError, aError, oError });
            } else {
                const userMap = ((profiles as any[]) || []).reduce((acc, p) => { acc[p.id] = p as UserMapValue; return acc; }, {} as UserMap);
                const agencyMap = ((agencies as any[]) || []).reduce((acc, a) => { acc[a.id] = { name: a.name }; return acc; }, {} as AgencyMap);
                const opTypeMap = ((opTypes as any[]) || []).reduce((acc, o) => { acc[o.id] = { name: o.name, impacts_balance: o.impacts_balance }; return acc; }, {} as OpTypeMap);
                setRelatedData({ users: userMap, agencies: agencyMap, opTypes: opTypeMap });
            }
        };
        fetchRelatedData();
    }, []);

    const filterItems = (filter: TabKey): (Transaction | Request)[] => {
        switch (filter) {
            case 'unassigned':
                return items.filter(item => !item.assigned_to);
            case 'assigned_to_me':
                return items.filter(item => item.assigned_to === user.id);
            case 'all':
                return items;
            default:
                return [];
        }
    };
    
    const handleLocalAction = (e: React.MouseEvent) => {
        const button = (e.target as HTMLElement).closest('button[data-action]');
        if (!button) return;
        
        e.stopPropagation(); // Prevent card from toggling

        const action = button.getAttribute('data-action');
        
        if (action === 'viewProof') {
            const url = button.getAttribute('data-url');
            if (url) handleAction('viewProof', url);
            return;
        }

        const id = button.getAttribute('data-id');
        
        if (!action || !id) return;
        
        const item = items.find(i => i.id === id);
        if (!item) return;

        const itemType = 'demandeur_id' in item ? 'requests' : 'transactions';
        const data = { id, type: itemType };

        if (action === 'assign-self') handleAction('assignTask', { ...data, targetUserId: user.id });
        if (action === 'unassign') handleAction('assignTask', { ...data, targetUserId: null });
        if (action === 'assign-other') handleAction('openAssignModal', data);
        if (action === 'validate') alert(`Validation de ${id} simulée.`);
        if (action === 'reject') alert(`Rejet de ${id} simulé.`);
        if (action === 'process-request') handleAction('openProcessRequestModal', item);
    };

    const handlePageChange = (tab: TabKey, page: number) => {
        setCurrentPages(prev => ({ ...prev, [tab]: page }));
        setExpandedItemId(null);
    };

    const renderQueue = (currentItems: (Transaction | Request)[], tab: TabKey) => {
        const currentPage = currentPages[tab];
        const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
        const paginatedItems = currentItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        if (paginatedItems.length === 0) {
            return <div className="text-center py-8 text-gray-500">
                <i className="fas fa-check-circle fa-3x text-green-400 mb-3"></i>
                <p>Aucun élément à traiter dans cette vue.</p>
            </div>;
        }

        return (
            <>
                <div className="space-y-4" onClick={handleLocalAction}>
                    {paginatedItems.map(item => {
                        const isExpanded = expandedItemId === item.id;
                        const isRequest = 'demandeur_id' in item;
                        const assignedUser = item.assigned_to ? relatedData.users[item.assigned_to] : null;

                        const getHeaderInfo = () => {
                            if (!item.assigned_to) return { bgColor: 'bg-amber-500', statusText: 'Non assignée' };
                            if (item.assigned_to === user.id) return { bgColor: 'bg-blue-600', statusText: 'Assignée à moi' };
                            return { bgColor: 'bg-slate-500', statusText: 'Assignée à ' + assignedUser?.name };
                        };
                        
                        const { bgColor, statusText } = getHeaderInfo();
                        
                        const tx = !isRequest ? (item as Transaction) : null;
                        const agent = tx ? relatedData.users[tx.agent_id] : null;
                        const agence = agent && agent.agency_id && relatedData.agencies[agent.agency_id] ? relatedData.agencies[agent.agency_id] : null;
                        const opType = tx ? relatedData.opTypes[tx.op_type_id] : null;
                        const opIcon = isRequest ? 'fa-info-circle' : (tx ? getOperationIcon(tx.op_type_id) : 'fa-receipt');

                        const req = isRequest ? (item as Request) : null;
                        const demandeur = req ? relatedData.users[req.demandeur_id] : null;

                        return (
                            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                               <div className={`p-3 text-white flex justify-between items-center ${bgColor}`}>
                                    <div className="flex items-center">
                                        <i className={`fas ${opIcon} fa-fw mr-3`}></i>
                                        <span className="font-bold">{isRequest ? req!.type : opType?.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold">{statusText}</span>
                                </div>

                                <div className="p-4 cursor-pointer" onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button')) return;
                                    setExpandedItemId(isExpanded ? null : item.id)
                                }}>
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <div className="flex-grow">
                                            <p className="font-mono text-xs text-gray-500">{item.id}</p>
                                            <p className="font-semibold text-gray-800 text-base">{isRequest ? req?.sujet : formatAmount(tx?.montant_principal)}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {isRequest ? `Par: ${demandeur?.name}` : `Par: ${agent?.name} (${agence?.name})`}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Détails de la tâche</h4>
                                         {isRequest ? (
                                            <div className="text-sm space-y-2 bg-gray-50 p-3 rounded-md">
                                               <p><strong>Description:</strong> {req?.description}</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm bg-gray-50 p-3 rounded-md">
                                                <p><strong>Frais:</strong> {formatAmount(tx?.frais)}</p>
                                                <p><strong>Total Débité:</strong> {formatAmount(tx?.montant_total)}</p>
                                                <div className="sm:col-span-2"><strong>Données:</strong> <pre className="text-xs bg-slate-200 p-2 rounded whitespace-pre-wrap">{JSON.stringify(tx?.data, null, 2)}</pre></div>
                                            </div>
                                        )}
                                        <div className="mt-3 flex justify-end items-center flex-wrap gap-2">
                                            {tx?.proof_url && <button className="btn btn-sm btn-outline-secondary" data-action="viewProof" data-url={tx.proof_url}><i className="fas fa-file-image mr-1 pointer-events-none"></i>Voir Preuve</button>}
                                            {!item.assigned_to && (
                                                <>
                                                    <button className="btn btn-sm btn-success" data-action="assign-self" data-id={item.id} title="S'assigner"><i className="fas fa-user-plus mr-1 pointer-events-none"></i>S'assigner</button>
                                                    {isAdminGeneral && <button className="btn btn-sm btn-info text-white" data-action="assign-other" data-id={item.id} title="Assigner à Sous-Admin"><i className="fas fa-user-tag mr-1 pointer-events-none"></i>Assigner</button>}
                                                </>
                                            )}
                                            {item.assigned_to === user.id && (
                                                isRequest ? (
                                                    <>
                                                        <button className="btn btn-sm btn-primary" data-action="process-request" data-id={item.id}><i className="fas fa-cogs mr-1 pointer-events-none"></i>Traiter la Requête</button>
                                                        <button className="btn btn-sm btn-outline-secondary" data-action="unassign" data-id={item.id} title="Libérer l'assignation"><i className="fas fa-undo mr-1 pointer-events-none"></i>Libérer</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn btn-sm btn-success" data-action="validate" data-id={item.id}><i className="fas fa-check mr-1 pointer-events-none"></i>Valider</button>
                                                        <button className="btn btn-sm btn-danger" data-action="reject" data-id={item.id}><i className="fas fa-times mr-1 pointer-events-none"></i>Rejeter</button>
                                                        <button className="btn btn-sm btn-outline-secondary" data-action="unassign" data-id={item.id} title="Libérer l'assignation"><i className="fas fa-undo mr-1 pointer-events-none"></i>Libérer</button>
                                                    </>
                                                )
                                            )}
                                            {(item.assigned_to && item.assigned_to !== user.id && isAdminGeneral) && (
                                                <button className="btn btn-sm btn-info text-white" data-action="assign-other" data-id={item.id} title="Réassigner"><i className="fas fa-user-edit mr-1 pointer-events-none"></i>Réassigner</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => handlePageChange(tab, page)} />
            </>
        );
    };

    const handleTabClick = (tabKey: TabKey) => {
        setActiveTab(tabKey);
        setExpandedItemId(null);
    }

    return (
        <Card title={title} icon={icon}>
            {description && <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">{description}</p>}
            <div className="tabs">
                <button onClick={() => handleTabClick('unassigned')} className={activeTab === 'unassigned' ? 'active' : ''}>Non Assignées ({filterItems('unassigned').length})</button>
                <button onClick={() => handleTabClick('assigned_to_me')} className={activeTab === 'assigned_to_me' ? 'active' : ''}>Mes Tâches ({filterItems('assigned_to_me').length})</button>
                {isAdminGeneral && <button onClick={() => handleTabClick('all')} className={activeTab === 'all' ? 'active' : ''}>Toutes en Attente ({filterItems('all').length})</button>}
            </div>
            <div className="tab-content mt-4">
                {activeTab === 'unassigned' && renderQueue(filterItems('unassigned'), 'unassigned')}
                {activeTab === 'assigned_to_me' && renderQueue(filterItems('assigned_to_me'), 'assigned_to_me')}
                {isAdminGeneral && activeTab === 'all' && renderQueue(filterItems('all'), 'all')}
            </div>
        </Card>
    );
};
