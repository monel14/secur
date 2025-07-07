
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { ChefAgence } from '../../types';
import { formatAmount } from '../../utils/formatters';

interface TransferCommissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    chef: ChefAgence;
}

export const TransferCommissionsModal: React.FC<TransferCommissionsModalProps> = ({ isOpen, onClose, onConfirm, chef }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount(chef.commissions_perso_dues); // Pre-fill with max amount
            setError('');
        }
    }, [isOpen, chef.commissions_perso_dues]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setError('');
        if (value === '') {
            setAmount('');
            return;
        }
        const numValue = Number(value);
        if (numValue > chef.commissions_perso_dues) {
            setError('Le montant ne peut pas dépasser les commissions dues.');
            setAmount(chef.commissions_perso_dues);
        } else if (numValue < 0) {
            setError('Le montant doit être positif.');
            setAmount(0);
        } else {
            setAmount(numValue);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount !== 'number' || amount <= 0 || amount > chef.commissions_perso_dues) {
            setError('Veuillez saisir un montant valide.');
            return;
        }
        onConfirm(amount);
    };

    const commissionsAfter = typeof amount === 'number' ? chef.commissions_perso_dues - amount : chef.commissions_perso_dues;
    const balanceAfter = typeof amount === 'number' ? chef.solde + amount : chef.solde;

    return (
        <Modal
            id="transfer-commissions-modal"
            title="Virer les commissions vers le solde"
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <p className="mb-4">Saisissez le montant de vos commissions que vous souhaitez transférer sur votre solde opérationnel.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <p className="text-sm text-purple-700">Commissions Dues</p>
                        <p className="text-lg font-bold text-purple-800">{formatAmount(chef.commissions_perso_dues)}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-700">Solde Opérationnel</p>
                        <p className="text-lg font-bold text-blue-800">{formatAmount(chef.solde)}</p>
                    </div>
                     <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600">Commissions (Après)</p>
                        <p className="text-lg font-bold text-purple-700">{formatAmount(commissionsAfter)}</p>
                    </div>
                     <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Solde (Après)</p>
                        <p className="text-lg font-bold text-blue-700">{formatAmount(balanceAfter)}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="transferAmount" className="form-label">Montant à transférer</label>
                    <input
                        type="number"
                        id="transferAmount"
                        className="form-input"
                        value={amount}
                        onChange={handleAmountChange}
                        max={chef.commissions_perso_dues}
                        required
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={typeof amount !== 'number' || amount <= 0}>
                        <i className="fas fa-exchange-alt mr-2"></i>Confirmer le Virement
                    </button>
                </div>
            </form>
        </Modal>
    );
};
