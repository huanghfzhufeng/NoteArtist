import React from 'react';

interface NeoBadgeProps {
  children: React.ReactNode;
  color?: 'accent' | 'secondary' | 'muted' | 'black';
  className?: string;
}

const NeoBadge: React.FC<NeoBadgeProps> = ({
  children,
  color = 'accent',
  className = ''
}) => {
  const colors: Record<string, string> = {
    accent: 'bg-[#FF6B6B]',
    secondary: 'bg-[#FFD93D]',
    muted: 'bg-[#C4B5FD]',
    black: 'bg-black text-white'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 border-4 border-black text-xs font-black uppercase tracking-widest ${colors[color]} shadow-[2px_2px_0px_0px_#000] ${className}`}>
      {children}
    </span>
  );
};

export default NeoBadge;
