import React from 'react';

const iconProps = {
  width: '28',
  height: '28',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const ImpressionIcon = () => (
  <svg {...iconProps}>
    <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20c5 0 9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const LinkClickIcon = () => (
  <svg {...iconProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const LandingPageIcon = () => (
  <svg {...iconProps}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

export const CPMIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
    <path d="M7 12a5 5 0 0 1 10 0" />
    <path d="M7 12a5 5 0 0 0 10 0" />
  </svg>
);

export const CPLIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M16 8H8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z" />
  </svg>
);

export const CPCIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <polyline points="8 12 12 16 16 12" />
  </svg>
);

export const CTRIcon = () => (
  <svg {...iconProps}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const ConnectRateIcon = () => (
  <svg {...iconProps}>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <line x1="6" y1="12" x2="11" y2="12" />
    <line x1="13" y1="12" x2="18" y2="12" />
  </svg>
);

export const ConversionIcon = () => (
  <svg {...iconProps}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const LeadsIcon = () => (
  <svg {...iconProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const SpendIcon = () => (
  <svg {...iconProps}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const ROASIcon = () => (
  <svg {...iconProps}>
    <path d="M3 3v18h18" />
    <polyline points="18 5 12 11 9 8 3 14" />
  </svg>
);

export const SalesIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const TicketIcon = () => (
  <svg {...iconProps}>
    <path d="M15 5H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
    <path d="M12 9v4M12 17v0" />
  </svg>
);
