
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { SousAdmin } from '../../types';

interface SuspendUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: SousAdmin | null;
    onConfirm: (user: SousAdmin, reason: string | null) => void;
}

export const SuspendUserModal: React.FC<SuspendUserModalProps> = ({ isOpen, onClose, user, onConfirm }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setReason('');
        }
    }, [isOpen]);

    if (!user) return null;

    const isSuspending = user.status === 'active';
    const title = isSuspending ? `Suspendre ${user.name}` : `Réactiver ${user.name}`;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(user, isSuspending ? reason : null);
        onClose();
    };

    return (
        <Modal id="suspend-user-modal" title={title} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <p className="mb-4">
                    {isSuspending 
                        ? `Êtes-vous sûr de vouloir suspendre le compte de ${user.name} ? L'utilisateur ne pourra plus se connecter.`
                        : `Êtes-vous sûr de vouloir réactiver le compte de ${user.name} ? L'utilisateur pourra de nouveau se connecter.`
                    }
                </p>

                {isSuspending && (
                    <div className="mb-6">
                        <label htmlFor="suspensionReason" className="form-label">Motif de la suspension (optionnel)</label>
                        <textarea
                            id="suspensionReason"
                            className="form-textarea"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Violation des politiques de sécurité..."
                        ></textarea>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className={`btn ${isSuspending ? 'btn-danger' : 'btn-success'}`}>
                        {isSuspending ? 'Confirmer la Suspension' : 'Confirmer la Réactivation'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
