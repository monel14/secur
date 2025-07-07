

import React, { useState, useMemo } from 'react';
import { PageComponentProps, SousAdmin } from '../../types';
import { Card } from '../../components/common/Card';
import { users, mockTransactions } from '../../data';
import { Pagination } from '../../components/common/Pagination';

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="card p-4">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <i className={`fas ${icon} fa-lg`}></i>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

const SubAdminCard: React.FC<{
    subAdmin: SousAdmin;
    assignedTasks: number;
    onAction: (action: string, data: any) => void;
}> = ({ subAdmin, assignedTasks, onAction }) => {
    
    return (
        <div className={`card flex flex-col justify-between hover:shadow-xl transition-all duration-300 ${subAdmin.status === 'suspended' ? 'bg-gray-100 opacity-70' : ''}`}>
            <div>
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <img src={`https://placehold.co/48x48/E2E8F0/4A5568?text=${subAdmin.avatar_seed}`} alt={subAdmin.name} className="w-12 h-12 rounded-full mr-4"/>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800">{subAdmin.name}</h4>
                            <p className="text-sm text-gray-500">{subAdmin.email}</p>
                        </div>
                    </div>
                    <span className={`badge ${subAdmin.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{subAdmin.status === 'active' ? 'Actif' : 'Suspendu'}</span>
                </div>
                
                <div className="my-4 space-y-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">Tâches assignées</p>
                        <p className="text-2xl font-bold text-blue-600">{assignedTasks}</p>
                    </div>
                     {subAdmin.status === 'suspended' && subAdmin.suspension_reason && (
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Motif de suspension</p>
                            <p className="text-sm text-red-700 bg-red-100 p-2 rounded-md">{subAdmin.suspension_reason}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-2">
                           {subAdmin.permissions?.can_validate_transactions ? 
                             <span className="badge badge-purple">Validation Transactions</span> : 
                             <span className="badge badge-gray">Validation Transactions</span>
                           }
                           {subAdmin.permissions?.can_manage_requests ?
                            <span className="badge badge-purple">Gestion Requêtes</span> :
                            <span className="badge badge-gray">Gestion Requêtes</span>
                           }
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-3 border-t flex items-center justify-end flex-wrap gap-2">
                <button
                    className="btn btn-sm btn-info text-white"
                    title="Modifier Permissions"
                    onClick={() => onAction('openSubAdminPermissionsModal', subAdmin.id)}
                    disabled={subAdmin.status === 'suspended'}
                >
                    <i className="fas fa-user-shield mr-1"></i> Permissions
                </button>
                <button
                    className={`btn btn-sm ${subAdmin.status === 'active' ? 'btn-warning text-white' : 'btn-success'}`}
                    title={subAdmin.status === 'active' ? 'Suspendre' : 'Réactiver'}
                    onClick={() => onAction('openSuspendUserModal', subAdmin)}
                >
                    <i className={`fas ${subAdmin.status === 'active' ? 'fa-ban' : 'fa-check-circle'} mr-1`}></i> 
                    {subAdmin.status === 'active' ? 'Suspendre' : 'Réactiver'}
                </button>
            </div>
        </div>
    );
};


export const AdminManageSubAdmins: React.FC<PageComponentProps> = ({ handleAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const subAdminsData = useMemo(() => {
        return Object.values(users).filter((u): u is SousAdmin => u.role === 'sous_admin');
    }, [users]);

    const filteredSubAdmins = useMemo(() => {
        if (!searchTerm) return subAdminsData;
        return subAdminsData.filter(sa =>
            sa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sa.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, subAdminsData]);
    
    const paginatedSubAdmins = useMemo(() => {
        return filteredSubAdmins.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [filteredSubAdmins, currentPage]);

    const totalPages = Math.ceil(filteredSubAdmins.length / ITEMS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }
    
    const totalAssignedTasks = mockTransactions.filter(t => t.assigned_to && users[t.assigned_to]?.role === 'sous_admin').length;
    const totalCompletedTasks = mockTransactions.filter(t => t.validateur_id && users[t.validateur_id]?.role === 'sous_admin').length;

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <StatCard title="Total Sous-Admins" value={subAdminsData.length} icon="fa-user-shield" />
                <StatCard title="Tâches Assignées" value={totalAssignedTasks} icon="fa-tasks" />
                <StatCard title="Tâches Traitées (Mois)" value={totalCompletedTasks} icon="fa-check-double" />
            </div>

            <Card title="Gestion des Sous-Administrateurs" icon="fa-users-cog">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                     <div className="relative flex-grow max-w-xs">
                         <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                         <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            className="form-input pl-10"
                            value={searchTerm}
                            onChange={handleSearchChange}
                         />
                    </div>
                    <button className="btn btn-success" onClick={() => handleAction('openCreateSubAdminModal')}>
                        <i className="fas fa-user-plus mr-2"></i>Créer un Sous-Admin
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {paginatedSubAdmins.map(sa => {
                        const assignedTasks = mockTransactions.filter(t => t.assigned_to === sa.id).length;
                        return <SubAdminCard key={sa.id} subAdmin={sa} assignedTasks={assignedTasks} onAction={handleAction} />
                    })}
                </div>
                {filteredSubAdmins.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <i className="fas fa-user-slash fa-2x mb-3 text-gray-400"></i>
                        <p>Aucun sous-administrateur ne correspond à votre recherche.</p>
                    </div>
                )}
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </Card>
        </>
    );
};
