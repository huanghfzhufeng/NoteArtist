import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface NeoButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'black' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm';
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const NeoButton: React.FC<NeoButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  onClick,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
}) => {
  const hClass = size === 'sm' ? 'h-10 px-4 text-sm' : 'h-14 px-8 text-lg';
  const base = `relative inline-flex items-center justify-center gap-3 ${hClass} font-black uppercase tracking-wider border-4 border-black transition-all duration-75 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden`;
  const active = "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0";
  
  const variants: Record<string, string> = {
    primary: `bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#ff8585] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_#000] ${active}`,
    secondary: `bg-[#FFD93D] text-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#ffe066] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_#000] ${active}`,
    black: `bg-black text-white shadow-[4px_4px_0px_0px_#C4B5FD] hover:bg-zinc-900 ${active}`,
    outline: `bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:bg-zinc-50 ${active}`,
    ghost: "bg-transparent border-transparent shadow-none hover:bg-[#C4B5FD]/20 hover:border-black hover:shadow-[4px_4px_0px_0px_#000]",
    danger: `bg-red-500 text-white shadow-[4px_4px_0px_0px_#000] hover:bg-red-600 ${active}`
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {disabled && variant !== 'ghost' ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        Icon && <Icon className="w-5 h-5 stroke-[3px]" />
      )}
      {children}
    </button>
  );
};

export default NeoButton;
