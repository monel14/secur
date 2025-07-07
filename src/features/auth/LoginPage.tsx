
import React, { useState } from 'react';
import { User } from '../../types';

interface LoginPageProps {
    onLogin: (email: string, password_not_used: string, role: User['role']) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('agent.alice@example.com');
    const [password, setPassword] = useState('password');
    const [role, setRole] = useState<User['role']>('agent');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        onLogin(email, password, role);
        // Loading state will be handled by the parent component's auth state change
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-4">
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <i className="fas fa-shield-alt text-5xl text-blue-600"></i>
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">SecureTrans</h1>
                    <p className="text-gray-600">Connectez-vous à votre compte</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" id="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="form-label">Mot de passe</label>
                        <input type="password" id="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="'password' for demo" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="role" className="form-label">Rôle (pour la démo)</label>
                        <select id="role" className="form-select" value={role} onChange={e => setRole(e.target.value as User['role'])}>
                            <option value="agent">Agent</option>
                            <option value="chef_agence">Chef d’agence</option>
                            <option value="admin_general">Administrateur général</option>
                            <option value="sous_admin">Sous-administrateur</option>
                            <option value="developpeur">Développeur</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full text-lg" disabled={loading}>
                        {loading ? 'Connexion...' : <><i className="fas fa-sign-in-alt mr-2"></i>Se connecter</>}
                    </button>
                </form>
                 <div className="text-center text-xs text-gray-500 mt-6 bg-gray-100 p-2 rounded-md">
                    <strong>Note pour la démo :</strong> Si le compte n'existe pas, il sera créé automatiquement avec le mot de passe <span className="font-mono bg-gray-200 px-1 rounded">'password'</span>.
                </div>
            </div>
        </div>
    );
};