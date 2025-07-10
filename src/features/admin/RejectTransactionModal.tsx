
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Transaction } from '../../types';
import { formatAmount } from '../../utils/formatters';

interface RejectTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onConfirm: (transaction: Transaction, reason: string) => void;
}

export const RejectTransactionModal: React.FC<RejectTransactionModalProps> = ({ isOpen, onClose, transaction, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setReason('');
            setError('');
        }
    }, [isOpen]);

    if (!transaction) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Le motif du rejet est obligatoire.');
            return;
        }
        onConfirm(transaction, reason);
        onClose();
    };

    return (
        <Modal
            id="reject-transaction-modal"
            title={`Rejeter la transaction ${transaction.id.substring(0, 8)}...`}
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <p className="mb-4">
                    Vous êtes sur le point de rejeter la transaction de <span className="font-bold">{formatAmount(transaction.montant_principal)}</span>.
                    Veuillez fournir un motif clair pour le rejet. Le montant total sera remboursé à l'agent.
                </p>

                <div className="mb-6">
                    <label htmlFor="rejectionReason" className="form-label">Motif du rejet</label>
                    <textarea
                        id="rejectionReason"
                        className="form-textarea"
                        rows={4}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Ex: Preuve de paiement illisible, informations bénéficiaire incorrectes..."
                        required
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-danger">
                         <i className="fas fa-times-circle mr-2"></i>Confirmer le Rejet
                    </button>
                </div>
            </form>
        </Modal>
    );
};
