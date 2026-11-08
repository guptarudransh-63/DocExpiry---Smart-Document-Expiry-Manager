import React from 'react';

export default function Badge({ status, daysRemaining }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: daysRemaining !== null && daysRemaining !== undefined
            ? `Active (${daysRemaining}d left)`
            : 'Active',
          className: 'bg-green-100 text-green-800 border-green-200',
          dot: 'bg-green-500',
        };
      case 'EXPIRING_SOON':
        return {
          label: daysRemaining !== null && daysRemaining !== undefined
            ? `Expiring Soon (${daysRemaining}d left)`
            : 'Expiring Soon',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'EXPIRED':
        return {
          label: daysRemaining !== null && daysRemaining !== undefined
            ? `Expired (${Math.abs(daysRemaining)}d ago)`
            : 'Expired',
          className: 'bg-red-100 text-red-800 border-red-200',
          dot: 'bg-red-500',
        };
      case 'ARCHIVED':
        return {
          label: 'Archived',
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
        };
      default:
        return {
          label: status || 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-400',
        };
    }
  };

  const { label, className, dot } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
