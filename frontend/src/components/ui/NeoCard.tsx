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
    <div className={`group relative border-4 border-black ${bgColors[color]} shadow-[8px_8px_0px_0px_#000] p-8 transition-transform duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#000] ${className}`}>
      {title && (
        <div className="absolute -top-6 left-6 bg-black text-white px-4 py-1.5 border-4 border-black font-black uppercase text-sm tracking-[0.2em] -rotate-2 group-hover:rotate-0 transition-transform duration-200">
          {title}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default NeoCard;
