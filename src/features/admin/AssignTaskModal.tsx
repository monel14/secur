
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { SousAdmin } from '../../types';
import { supabase } from '../../supabaseClient';

interface AssignTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (targetUserId: string) => void;
    taskData: { id: string; type: 'transactions' | 'requests' } | null;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose, onAssign, taskData }) => {
    const [targetUserId, setTargetUserId] = useState('');
    const [subAdmins, setSubAdmins] = useState<SousAdmin[]>([]);

    useEffect(() => {
        const fetchSubAdmins = async () => {
            if (isOpen) {
                const { data, error } = await supabase.from('profiles').select('*').eq('role', 'sous_admin');
                if (error) {
                    console.error('Error fetching sub-admins:', error);
                } else {
                    const admins = (data as unknown as SousAdmin[]) || [];
                    setSubAdmins(admins);
                    if (admins.length > 0) {
                        setTargetUserId(admins[0].id);
                    }
                }
            }
        };
        fetchSubAdmins();
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (targetUserId) {
            onAssign(targetUserId);
        }
    };

    if (!taskData) return null;

    return (
        <Modal id="assign-task-modal" title={`Assigner Tâche ${taskData.id.substring(0,8)}...`} isOpen={isOpen} onClose={onClose}>
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