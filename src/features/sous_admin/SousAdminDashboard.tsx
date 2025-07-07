

import React from 'react';
import { PageComponentProps } from '../../types';
import { Card } from '../../components/common/Card';
import { mockTransactions } from '../../data';

export const SousAdminDashboard: React.FC<PageComponentProps> = ({ user, navigateTo }) => {
    const myAssignedTransactions = mockTransactions.filter(t => t.assigned_to === user.id && t.status.includes('En attente')).length;
    const unassignedTransactions = mockTransactions.filter(t => t.status.includes('En attente') && !t.assigned_to).length;

    return (
        <>
            <Card title={`Bienvenue ${user.name}`} icon="fa-user-check">
                <p>Vos tâches principales : validation des transactions qui vous sont assignées, ou que vous vous assignez depuis les files d'attente.</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card title="Mes Validations Assignées" icon="fa-tasks" className="">
                    <p className="text-2xl font-bold text-orange-500 mb-2">{myAssignedTransactions} <span className="text-sm font-normal">opérations</span></p>
                    <button className="btn btn-warning w-full" onClick={() => navigateTo('Validation Transactions')}>
                        <i className="fas fa-user-check mr-2"></i>Voir mes validations
                    </button>
                </Card>
                 <Card title="Validations Non Assignées" icon="fa-ballot-check" className="">
                    <p className="text-2xl font-bold text-blue-500 mb-2">{unassignedTransactions} <span className="text-sm font-normal">disponibles</span></p>
                    <button className="btn btn-info text-white w-full" onClick={() => navigateTo('Validation Transactions')}>
                        <i className="fas fa-ballot-check mr-2"></i>Voir et s'assigner
                    </button>
                </Card>
            </div>
        </>
    );
};
