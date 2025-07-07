

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { AgentRechargeRequest } from '../../types';
import { formatAmount } from '../../utils/formatters';

interface RejectRechargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (requestId: string, reason: string) => void;
    request: AgentRechargeRequest | null;
}

export const RejectRechargeModal: React.FC<RejectRechargeModalProps> = ({ isOpen, onClose, onConfirm, request }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) setReason('');
    }, [isOpen]);

    if (!request) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(request.id, reason);
        onClose();
    };

    return (
        <Modal id="reject-recharge-modal" title={`Rejeter la demande de ${formatAmount(request.amount)}`} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="rejectionReason" className="form-label">Motif du rejet (obligatoire)</label>
                    <textarea
                        id="rejectionReason"
                        className="form-textarea"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Expliquez pourquoi la demande est rejetée..."
                        required
                    ></textarea>
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
