import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'large';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'default', 
  className = '' 
}) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('validé') || normalizedStatus.includes('approuvé') || normalizedStatus.includes('active')) {
      return {
        classes: 'status-badge status-success',
        icon: 'fa-check-circle',
        ariaLabel: 'Statut: Validé'
      };
    }
    
    if (normalizedStatus.includes('attente') || normalizedStatus.includes('pending')) {
      return {
        classes: 'status-badge status-pending',
        icon: 'fa-clock',
        ariaLabel: 'Statut: En attente'
      };
    }
    
    if (normalizedStatus.includes('rejeté') || normalizedStatus.includes('refusé') || normalizedStatus.includes('suspended')) {
      return {
        classes: 'status-badge status-error',
        icon: 'fa-times-circle',
        ariaLabel: 'Statut: Rejeté'
      };
    }
    
    return {
      classes: 'status-badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      icon: 'fa-info-circle',
      ariaLabel: `Statut: ${status}`
    };
  };

  const config = getStatusConfig(status);
  const sizeClasses = variant === 'large' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span 
      className={`${config.classes} ${sizeClasses} ${className}`}
      role="status"
      aria-label={config.ariaLabel}
    >
      <i className={`fas ${config.icon} mr-1`} aria-hidden="true" />
      {status}
    </span>
  );
};