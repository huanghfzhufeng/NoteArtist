import React from 'react';

interface NeoInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  type?: string;
}

const NeoInput: React.FC<NeoInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 1,
  className = '',
  type = 'text'
}) => {
  const baseInput = "w-full border-4 border-black bg-white p-4 font-bold placeholder:text-zinc-400 focus:outline-none focus:bg-[#FFFDF5] focus:shadow-[4px_4px_0px_0px_#000] focus:-translate-x-[2px] focus:-translate-y-[2px] transition-all duration-150";

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {label && <label className="font-black uppercase tracking-[0.2em] text-xs text-zinc-500 ml-1">{label}</label>}
      {rows > 1 ? (
        <textarea
          className={`${baseInput} text-sm md:text-base resize-none font-mono leading-relaxed min-h-[120px]`}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          className={`${baseInput} h-14 text-lg`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default NeoInput;
