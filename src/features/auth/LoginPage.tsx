
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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <i className="fas fa-shield-alt text-4xl text-white"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-white mt-2">SecureTrans</h1>
                    <p className="text-gray-400">Connectez-vous à votre compte sécurisé</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email" className="form-label text-gray-300">Email</label>
                        <input type="email" id="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="form-label text-gray-300">Mot de passe</label>
                        <input type="password" id="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="'password' for demo" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="role" className="form-label text-gray-300">Rôle (pour la démo)</label>
                        <select id="role" className="form-select" value={role} onChange={e => setRole(e.target.value as User['role'])}>
                            <option value="agent">Agent</option>
                            <option value="chef_agence">Chef d’agence</option>
                            <option value="admin_general">Administrateur général</option>
                            <option value="sous_admin">Sous-administrateur</option>
                            <option value="developpeur">Développeur</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full text-lg font-semibold text-white px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                        {loading ? 'Connexion...' : <><i className="fas fa-sign-in-alt mr-2"></i>Se connecter</>}
                    </button>
                </form>
                 <div className="text-center text-xs text-gray-500 mt-6 bg-gray-900/50 p-2 rounded-md border border-gray-700">
                    <strong>Note pour la démo :</strong> Si le compte n'existe pas, il sera créé avec le mot de passe <span className="font-mono bg-gray-700 text-gray-300 px-1 rounded">'password'</span>.
                </div>
            </div>
        </div>
    );
};
