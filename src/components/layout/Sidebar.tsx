
import React, { forwardRef } from 'react';
import { User, NavLink } from '../../types';

interface SidebarProps {
    isOpen: boolean;
    currentUser: User;
    navigationLinks: { [role: string]: NavLink[] };
    currentPageKey: string;
    handleNavigate: (pageKey: string) => void;
    handleAction: (actionKey: string, data?: any) => void;
    handleLogout: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(({ isOpen, currentUser, navigationLinks, currentPageKey, handleNavigate, handleAction, handleLogout }, ref) => {
    return (
        <aside ref={ref} className={`sidebar w-64 bg-gray-800 text-gray-100 p-4 space-y-2 flex flex-col fixed inset-y-0 left-0 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="text-2xl font-semibold text-center py-3 border-b border-gray-700 flex items-center justify-center">
                <i className="fas fa-shield-alt mr-2 text-blue-400"></i>
                <span>SecureTrans</span>
            </div>
            <nav className="mt-2 flex-grow overflow-y-auto space-y-1">
                {navigationLinks[currentUser.role].map(link => (
                    <a key={link.key} href="#" onClick={(e) => {
                        e.preventDefault();
                        if (link.component) handleNavigate(link.key);
                        if (link.action) handleAction(link.action);
                    }} className={`flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm group ${link.key === currentPageKey ? 'bg-gray-900' : ''}`}>
                        <i className={`fas ${link.icon} w-5 text-center text-gray-400 group-hover:text-gray-200`}></i>
                        <span className="text-gray-200 group-hover:text-white">{link.label}</span>
                    </a>
                ))}
            </nav>
            <div className="mt-auto pt-2 border-t border-gray-700">
                <button onClick={handleLogout} className="btn btn-danger w-full">
                    <i className="fas fa-sign-out-alt mr-2"></i>Déconnexion
                </button>
            </div>
        </aside>
    );
});