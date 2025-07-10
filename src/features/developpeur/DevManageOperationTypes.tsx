





import React, { useState, useMemo, useEffect } from 'react';
import { PageComponentProps, OperationType, CommissionConfig, FormField } from '../../types';
import { Card } from '../../components/common/Card';
import { getBadgeClass } from '../../utils/uiHelpers';
import { formatAmount } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';
import { supabase } from '../../supabaseClient';

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center">
        <i className={`fas ${icon} text-2xl text-gray-500 mr-4`}></i>
        <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// New component for expanded details
const ExpandedOpTypeDetails: React.FC<{ opType: OperationType }> = ({ opType }) => {
    
    const renderCommission = () => {
        const config = opType.commission_config;
        if (!config) return <p>Commission non configurée.</p>;
        
        switch (config.type) {
            case 'none':
                return <p>Aucune commission</p>;
            case 'fixed':
                return <p>Fixe: <span className="font-semibold">{formatAmount(config.amount)}</span></p>;
            case 'percentage':
                return <p>Pourcentage: <span className="font-semibold">{config.rate}%</span></p>;
            case 'tiers':
                return (
                    <div>
                        <h5 className="font-semibold text-gray-600 mb-2">Paliers de Commission</h5>
                        <div className="overflow-x-auto">
                            <table className="w-full table-sm text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left font-medium">De (XOF)</th>
                                        <th className="p-2 text-left font-medium">À (XOF)</th>
                                        <th className="p-2 text-left font-medium">Commission</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {config.tiers?.map((tier, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">{tier.from.toLocaleString()}</td>
                                            <td className="p-2">{tier.to === null ? 'Infini' : tier.to.toLocaleString()}</td>
                                            <td className="p-2">{tier.commission}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-50 p-4 border-l-4 border-blue-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h5 className="font-semibold text-gray-600 mb-2">Champs du Formulaire</h5>
                    {Array.isArray(opType.fields) && opType.fields.length > 0 ? (
                        <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                            {opType.fields.map((field: any) => (
                                <li key={field.id} className="p-2 bg-white rounded border flex justify-between items-center">
                                    <div>
                                        <span className="font-medium text-gray-800">{field.label}</span>
                                        <span className="text-gray-500 text-xs block">({field.name}, type: {field.type})</span>
                                    </div>
                                    <span className={`badge ${field.required ? 'badge-danger' : 'badge-gray'}`}>{field.required ? 'Requis' : 'Optionnel'}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Aucun champ de formulaire défini.</p>
                    )}
                </div>
                <div>
                    {renderCommission()}
                    <h5 className="font-semibold text-gray-600 mt-4 mb-2">Autres Paramètres</h5>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Preuve de paiement requise:</span>
                            <span className={`font-semibold ${opType.proof_is_required ? 'text-green-600' : 'text-red-600'}`}>{opType.proof_is_required ? 'Oui' : 'Non'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const DevManageOperationTypes: React.FC<PageComponentProps> = ({ handleAction }) => {
    const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOpId, setExpandedOpId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchOpTypes = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('operation_types').select('id, name, description, impacts_balance, proof_is_required, status, fields, commission_config');
            if (error) {
                console.error(error);
            } else {
                const fetchedOpTypes: OperationType[] = (data || []).map((item: any) => ({
                    ...item,
                    fields: item.fields || [],
                    commission_config: item.commission_config || { type: 'none' }
                }));
                setOperationTypes(fetchedOpTypes);
            }
            setLoading(false);
        };
        fetchOpTypes();
    }, []);

    const filteredOperationTypes = useMemo(() => {
        return operationTypes.filter(opType => {
            const matchesSearch = searchTerm === '' || 
                                  opType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (opType.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || opType.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, operationTypes]);
    
    const stats = useMemo(() => {
        return operationTypes.reduce((acc, op) => {
            acc.total++;
            if(op.status === 'active') acc.active++;
            else if (op.status === 'inactive') acc.inactive++;
            else if (op.status === 'archived') acc.archived++;
            return acc;
        }, { total: 0, active: 0, inactive: 0, archived: 0 });
    }, [operationTypes]);

    const totalPages = Math.ceil(filteredOperationTypes.length / ITEMS_PER_PAGE);
    const paginatedOpTypes = useMemo(() => {
        return filteredOperationTypes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [filteredOperationTypes, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setExpandedOpId(null);
    };

    const handleRowToggle = (opId: string) => {
        setExpandedOpId(currentId => (currentId === opId ? null : opId));
    };

    const handleTableClick = (e: React.MouseEvent) => {
        const button = (e.target as HTMLElement).closest('button[data-action]');
        if (button) {
            e.stopPropagation();
            const action = button.getAttribute('data-action');
            const id = button.getAttribute('data-id');
            
            if (!action || !id) return;

            if (action === 'edit-op-type') handleAction('openDevOpTypeModal', id);
            if (action === 'duplicateOpType') handleAction('duplicateOpType', id);
            if (action === 'toggleOpTypeStatus') handleAction('toggleOpTypeStatus', id);
        } else {
             const row = (e.target as HTMLElement).closest('tr[data-op-id]');
             if(row) {
                 const id = row.getAttribute('data-op-id');
                 if(id) handleRowToggle(id);
             }
        }
    };
    
    if (loading) return <Card title="Gestion des Types d'Opérations" icon="fa-list-ul"><div>Chargement...</div></Card>;

    const headers = ['', 'Nom', 'Impacte Solde?', 'Preuve Requise?', 'Statut', 'Champs', 'Actions'];

    return (
        <>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-semibold text-gray-700">Gestion des Types d'Opérations</h2>
                <button className="btn btn-success" onClick={() => handleAction('openDevOpTypeModal', null)}>
                    <i className="fas fa-plus-circle mr-2"></i>Créer Nouveau Type
                </button>
            </div>
            
            <Card title="Aperçu et Filtres" icon="fa-filter">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <StatCard title="Total" value={stats.total} icon="fa-cogs" />
                    <StatCard title="Actifs" value={stats.active} icon="fa-check-circle" />
                    <StatCard title="Inactifs" value={stats.inactive} icon="fa-pause-circle" />
                    <StatCard title="Archivés" value={stats.archived} icon="fa-archive" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="form-label" htmlFor="op-type-search">Rechercher</label>
                        <input 
                            type="text" 
                            id="op-type-search"
                            className="form-input" 
                            placeholder="Rechercher par nom ou description..."
                            value={searchTerm}
                            onChange={(e) => {setSearchTerm(e.target.value); handlePageChange(1);}}
                        />
                    </div>
                     <div>
                        <label className="form-label" htmlFor="op-type-status-filter">Filtrer par statut</label>
                        <select 
                            id="op-type-status-filter"
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => {setStatusFilter(e.target.value); handlePageChange(1);}}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actif</option>
                            <option value="inactive">Inactif</option>
                            <option value="archived">Archivé</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card title="Liste des types d'opérations" icon="fa-list-ul">
                <p className="text-sm text-gray-600 mb-2">{`${filteredOperationTypes.length} type(s) d'opérations trouvé(s).`}</p>
                 <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full table">
                        <thead className="bg-gray-50">
                            <tr>
                                {headers.map(h => <th key={h} className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200" onClick={handleTableClick}>
                            {paginatedOpTypes.length === 0 ? (
                                <tr><td colSpan={headers.length} className="text-center text-gray-500 py-4">Aucun type d'opération ne correspond à votre recherche.</td></tr>
                            ) : (
                                paginatedOpTypes.map(opType => (
                                    <React.Fragment key={opType.id}>
                                        <tr data-op-id={opType.id} className="cursor-pointer hover:bg-gray-50">
                                            <td className="p-3">
                                                <i className={`fas fa-chevron-right text-gray-400 transition-transform ${expandedOpId === opType.id ? 'rotate-90' : ''}`}></i>
                                            </td>
                                            <td className="p-3 font-medium text-gray-900">{opType.name}</td>
                                            <td className="p-3"><span className={opType.impacts_balance ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{opType.impacts_balance ? 'Oui' : 'Non'}</span></td>
                                            <td className="p-3"><span className={opType.proof_is_required ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{opType.proof_is_required ? 'Oui' : 'Non'}</span></td>
                                            <td className="p-3"><span className={`badge ${getBadgeClass(opType.status)}`}>{opType.status}</span></td>
                                            <td className="p-3 text-center">{Array.isArray(opType.fields) ? opType.fields.length : 0}</td>
                                            <td className="p-3">
                                                <div className="flex items-center space-x-1">
                                                    <button className="btn btn-xs btn-info text-white !py-1 !px-2" data-action="edit-op-type" data-id={opType.id} title="Éditer"><i className="fas fa-edit pointer-events-none"></i></button>
                                                    <button className="btn btn-xs btn-secondary !py-1 !px-2" data-action="duplicateOpType" data-id={opType.id} title="Dupliquer"><i className="fas fa-copy pointer-events-none"></i></button>
                                                    <button className="btn btn-xs btn-warning text-white !py-1 !px-2" data-action="toggleOpTypeStatus" data-id={opType.id} title="Changer Statut"><i className="fas fa-sync-alt pointer-events-none"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOpId === opType.id && (
                                            <tr>
                                                <td colSpan={headers.length} className="p-0 bg-gray-50">
                                                    <ExpandedOpTypeDetails opType={opType} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </Card>
        </>
    );
};