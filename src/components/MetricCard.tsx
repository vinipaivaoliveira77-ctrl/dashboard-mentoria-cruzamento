import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  color = 'blue'
}) => {
  return (
    <div className={`metric-card metric-${color}`}>
      {icon && <span className="metric-icon">{icon}</span>}
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
};
