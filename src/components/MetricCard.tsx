import React from 'react';

interface MetricCardProps {
  label: string;
  sublabel?: string;
  value: string | number;
  icon?: string | React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  sublabel,
  value,
  icon,
  color = 'blue'
}) => {
  return (
    <div className={`metric-card metric-${color}`}>
      {icon && <span className="metric-icon">{icon}</span>}
      <p className="metric-label">{label}</p>
      {sublabel && <p className="metric-sublabel">{sublabel}</p>}
      <p className="metric-value">{value}</p>
    </div>
  );
};
