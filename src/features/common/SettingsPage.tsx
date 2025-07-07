import React from 'react';
import { PageComponentProps } from '../../types';
import { Card } from '../../components/common/Card';

interface SettingsPageProps extends PageComponentProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    notificationSettings: { email: boolean; inApp: boolean };
    onNotificationSettingsChange: (settings: { email: boolean; inApp: boolean }) => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  </label>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme, toggleTheme, notificationSettings, onNotificationSettingsChange }) => {

    const handleNotifChange = (key: 'email' | 'inApp') => {
        onNotificationSettingsChange({
            ...notificationSettings,
            [key]: !notificationSettings[key],
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
             <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Paramètres</h1>
             <Card title="Apparence" icon="fa-palette">
                <div className="flex justify-between items-center p-4">
                    <div>
                        <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Mode Sombre</h4>
                        <p className="text-sm text-gray-500">Activez pour une expérience visuelle plus reposante.</p>
                    </div>
                    <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
                </div>
             </Card>
              <Card title="Notifications" icon="fa-bell">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="flex justify-between items-center p-4">
                         <div>
                            <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Notifications par Email</h4>
                            <p className="text-sm text-gray-500">Recevoir des résumés et alertes importantes par email.</p>
                        </div>
                        <ToggleSwitch checked={notificationSettings.email} onChange={() => handleNotifChange('email')} />
                    </div>
                     <div className="flex justify-between items-center p-4">
                         <div>
                            <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Notifications dans l'Application</h4>
                            <p className="text-sm text-gray-500">Afficher les badges et pop-ups de notification.</p>
                        </div>
                        <ToggleSwitch checked={notificationSettings.inApp} onChange={() => handleNotifChange('inApp')} />
                    </div>
                </div>
             </Card>
        </div>
    );
};
