import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Agent } from '../../types';

interface SuspendAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: Agent | null;
    onConfirm: (agentId: string, reason: string | null) => void;
}

export const SuspendAgentModal: React.FC<SuspendAgentModalProps> = ({ isOpen, onClose, agent, onConfirm }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) setReason('');
    }, [isOpen]);

    if (!agent) return null;

    const isSuspending = agent.status === 'active';
    const title = isSuspending ? `Suspendre ${agent.name}` : `Réactiver ${agent.name}`;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(agent.id, isSuspending ? reason : null);
        onClose();
    };

    return (
        <Modal id="suspend-agent-modal" title={title} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <p className="mb-4">
                    {isSuspending 
                        ? `Êtes-vous sûr de vouloir suspendre le compte de ${agent.name} ? L'agent ne pourra plus effectuer d'opérations.`
                        : `Êtes-vous sûr de vouloir réactiver le compte de ${agent.name} ? L'agent pourra de nouveau opérer.`
                    }
                </p>

                {isSuspending && (
                    <div className="mb-6">
                        <label htmlFor="suspensionReasonAgent" className="form-label">Motif de la suspension (optionnel)</label>
                        <textarea
                            id="suspensionReasonAgent"
                            className="form-textarea"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Audit en cours, non-respect des procédures..."
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
