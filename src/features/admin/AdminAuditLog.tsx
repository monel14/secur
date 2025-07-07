
import React, { useState, useMemo } from 'react';
import { PageComponentProps, AuditLog } from '../../types';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { mockAuditLogs } from '../../data';
import { formatDate } from '../../utils/formatters';
import { Pagination } from '../../components/common/Pagination';

export const AdminAuditLog: React.FC<PageComponentProps> = () => {
    const [logs] = useState<AuditLog[]>(mockAuditLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [logs, currentPage]);

    const headers = ['Timestamp', 'Utilisateur', 'Rôle', 'Action', 'Entité', 'Détails', 'IP'];
    const rows = paginatedLogs.map(log => [
        formatDate(log.timestamp),
        log.user,
        log.role,
        log.action,
        log.entity,
        log.details,
        log.ip
    ]);

    return (
        <Card title="Journal d'Audit des Actions Système" icon="fa-clipboard-list">
             <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-gray-50">
                <div><label className="form-label form-label-sm">Date</label><input type="date" className="form-input form-input-sm"/></div>
                <div><label className="form-label form-label-sm">Utilisateur</label><input type="text" className="form-input form-input-sm"/></div>
                <div><label className="form-label form-label-sm">Type d'Action</label><select className="form-select form-select-sm"><option>Toutes</option></select></div>
            </form>
            <Table headers={headers} rows={rows} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};
