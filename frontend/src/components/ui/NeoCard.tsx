import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  title?: string;
  color?: 'white' | 'yellow' | 'red' | 'violet' | 'cream';
  className?: string;
}

const bgColors: Record<string, string> = {
  white: 'bg-white',
  yellow: 'bg-[#FFD93D]',
  red: 'bg-[#FF6B6B]',
  violet: 'bg-[#C4B5FD]',
  cream: 'bg-[#FFFDF5]'
};

const NeoCard: React.FC<NeoCardProps> = ({
  children,
  title,
  color = 'white',
  className = '',
}) => {
  return (
    <div className={`relative border-4 border-black ${bgColors[color]} shadow-[8px_8px_0px_0px_#000] p-6 ${className}`}>
      {title && (
        <div className="absolute -top-5 left-4 bg-black text-white px-3 py-1 border-4 border-black font-black uppercase text-sm tracking-widest -rotate-1">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export default NeoCard;
