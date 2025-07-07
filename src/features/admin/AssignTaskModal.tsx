
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { users } from '../../data';
import { SousAdmin } from '../../types';

interface AssignTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (targetUserId: string) => void;
    taskData: { id: string; type: 'transactions' | 'requests' } | null;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose, onAssign, taskData }) => {
    const [targetUserId, setTargetUserId] = useState('');
    const subAdmins = Object.values(users).filter((u): u is SousAdmin => u.role === 'sous_admin');

    useEffect(() => {
        if (isOpen && subAdmins.length > 0) {
            setTargetUserId(subAdmins[0].id);
        }
    }, [isOpen, subAdmins]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (targetUserId) {
            onAssign(targetUserId);
        }
    };

    if (!taskData) return null;

    return (
        <Modal id="assign-task-modal" title={`Assigner Tâche ${taskData.id}`} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="form-label" htmlFor="subAdminSelect">Choisir un Sous-Administrateur</label>
                    <select
                        id="subAdminSelect"
                        className="form-select"
                        value={targetUserId}
                        onChange={e => setTargetUserId(e.target.value)}
                    >
                        {subAdmins.map(sa => (
                            <option key={sa.id} value={sa.id}>{sa.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="form-label" htmlFor="assignNotes">Notes (optionnel)</label>
                    <textarea id="assignNotes" className="form-textarea" rows={2}></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Assigner</button>
                </div>
            </form>
        </Modal>
    );
};
