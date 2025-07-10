

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { SousAdmin } from '../../types';

interface SubAdminPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subAdmin: SousAdmin | null;
    onSave: (id: string, permissions: SousAdmin['permissions']) => void;
}

const defaultPermissions = {
    can_validate_transactions: false,
    can_manage_requests: false,
};

export const SubAdminPermissionsModal: React.FC<SubAdminPermissionsModalProps> = ({ isOpen, onClose, subAdmin, onSave }) => {
    const [permissions, setPermissions] = useState<SousAdmin['permissions']>(defaultPermissions);

    useEffect(() => {
        if (subAdmin) {
            setPermissions(subAdmin.permissions || defaultPermissions);
        }
    }, [subAdmin]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setPermissions(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subAdmin) {
            onSave(subAdmin.id, permissions);
        }
        onClose();
    };

    if (!subAdmin) return null;

    return (
        <Modal
            id="subadmin-permissions-modal"
            title={`Permissions pour ${subAdmin.name}`}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <p className="text-sm text-gray-600 mb-4">Cochez les permissions que vous souhaitez accorder à cet utilisateur.</p>
                <div className="space-y-4 mb-6">
                    <div className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <label htmlFor="perm-validate" className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                id="perm-validate"
                                name="can_validate_transactions"
                                checked={permissions?.can_validate_transactions}
                                onChange={handleCheckboxChange}
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4 mt-1"
                            />
                            <div>
                                <span className="font-semibold text-gray-800">Valider les transactions</span>
                                <p className="text-xs text-gray-500 mt-1">Autorise l'utilisateur à approuver ou rejeter les opérations financières (transferts, paiements) soumises par les agents.</p>
                            </div>
                        </label>
                    </div>
                    <div className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                         <label htmlFor="perm-requests" className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                id="perm-requests"
                                name="can_manage_requests"
                                checked={permissions?.can_manage_requests}
                                onChange={handleCheckboxChange}
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4 mt-1"
                            />
                             <div>
                                <span className="font-semibold text-gray-800">Gérer les requêtes</span>
                                <p className="text-xs text-gray-500 mt-1">Permet de consulter, répondre et traiter les requêtes de support, les signalements de problèmes et les suggestions des utilisateurs.</p>
                            </div>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save mr-2"></i> Enregistrer
                    </button>
                </div>
            </form>
        </Modal>
    );
};