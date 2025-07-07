





import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { OperationType, Agent, FormField, CommissionConfig } from '../../types';
import { formatAmount } from '../../utils/formatters';
import { supabase } from '../../supabaseClient';

interface NewOperationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Agent;
    onSave: (opData: any) => void;
}

export const NewOperationModal: React.FC<NewOperationModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [availableOpTypes, setAvailableOpTypes] = useState<OperationType[]>([]);
    const [selectedOpType, setSelectedOpType] = useState<OperationType | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    
    useEffect(() => {
        const fetchOpTypes = async () => {
            if (!user.agency_id) return;
            // This is a simplification. A real app would use a join or an RPC function.
            // For now, fetch all active op types and assume the user has access.
            const { data, error } = await supabase
                .from('operation_types')
                .select('id, name, description, impacts_balance, proof_is_required, status, fields, commission_config')
                .eq('status', 'active');
            
            if (error) {
                console.error(error)
            } else {
                const mappedData = (data as any[] || []).map(op => ({
                    ...op,
                    fields: (op.fields as FormField[] | null) || [],
                    commission_config: (op.commission_config as CommissionConfig | null) || { type: 'none' }
                }));
                setAvailableOpTypes(mappedData as OperationType[]);
            }
        };
        if(isOpen) {
            fetchOpTypes();
        }
    }, [isOpen, user.agency_id]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedOpType(null);
            setFormData({});
            setProofFile(null);
            setIsFormValid(false);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (!selectedOpType || !Array.isArray(selectedOpType.fields)) {
            setIsFormValid(false);
            return;
        }
        
        const requiredFields = selectedOpType.fields.filter(f => f.required);
        const allRequiredFieldsFilled = requiredFields.every(field => formData[field.name] && formData[field.name] !== '');
        
        const isProofValid = !selectedOpType.proof_is_required || !!proofFile;
        
        setIsFormValid(allRequiredFieldsFilled && isProofValid);

    }, [selectedOpType, formData, proofFile]);

    const handleOpTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const opTypeId = e.target.value;
        const opType = availableOpTypes.find(ot => ot.id === opTypeId) || null;
        setSelectedOpType(opType);
        let initialFormData = {};
        if (opType && Array.isArray(opType.fields)) {
            initialFormData = opType.fields.reduce((acc: Record<string, any>, field: any) => {
                if(field.defaultValue) {
                    acc[field.name] = field.defaultValue;
                }
                return acc;
            }, {} as Record<string, any>);
        }
        setFormData(initialFormData);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        } else {
            setProofFile(null);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        onSave({ opTypeId: selectedOpType?.id, formData, proofFile });
        onClose();
    };
    
    const opFields = selectedOpType?.fields || [];
    const amountInput = opFields.find((f) => f.name.includes('montant'));
    const currentAmount = amountInput ? Number(formData[amountInput.name]) || 0 : 0;
    const balanceAfter = selectedOpType?.impacts_balance ? (user.solde ?? 0) - currentAmount : user.solde;

    return (
        <Modal id="agent-new-operation-modal" title="Initier une nouvelle opération" isOpen={isOpen} onClose={onClose} size="modal-lg">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="form-label" htmlFor="opType">Sélectionner le Type d'Opération</label>
                    <select id="opType" className="form-select" onChange={handleOpTypeChange} defaultValue="">
                        <option value="" disabled>-- Choisir un type --</option>
                        {availableOpTypes.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                    </select>
                </div>

                {selectedOpType && (
                    <>
                        <div className="p-4 border rounded-md bg-gray-50 min-h-[150px]">
                            <h4 className="font-semibold mb-3">{selectedOpType.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {opFields.map((field) => (
                                <div key={field.id}>
                                    <label className="form-label form-label-sm" htmlFor={field.id}>
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'select' ? (
                                        <select id={field.id} name={field.name} className="form-select form-select-sm" value={formData[field.name] || ''} onChange={handleFieldChange} required={field.required} defaultValue={field.defaultValue}>
                                            {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            id={field.id}
                                            name={field.name}
                                            className="form-input form-input-sm"
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={handleFieldChange}
                                            required={field.required}
                                            defaultValue={field.defaultValue}
                                        />
                                    )}
                                </div>
                            ))}
                            </div>
                        </div>

                        <div className="my-4">
                            <label className="form-label" htmlFor="opProofAgent">
                                Télécharger la Preuve de Transaction
                                {selectedOpType.proof_is_required && <span className="text-red-500">*</span>}
                            </label>
                            <input 
                                type="file" 
                                id="opProofAgent" 
                                className="form-input"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, application/pdf"
                                required={selectedOpType.proof_is_required}
                            />
                            <p className="text-xs text-gray-500 mt-1">Formats: JPG, PNG, PDF. Max 2MB.</p>
                        </div>
                    </>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                    <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700">Votre Solde Actuel :</p>
                        <p className="text-lg font-semibold text-blue-800">{formatAmount(user.solde)}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-700">Solde Après Opération :</p>
                        <p className="text-lg font-semibold text-green-800">{formatAmount(balanceAfter)}</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
                        <i className="fas fa-paper-plane mr-2"></i>Soumettre pour Validation
                    </button>
                </div>
            </form>
        </Modal>
    );
};
