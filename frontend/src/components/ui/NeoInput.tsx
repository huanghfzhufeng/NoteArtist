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
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="font-bold uppercase tracking-wide text-sm">{label}</label>}
      {rows > 1 ? (
        <textarea
          className="w-full border-4 border-black bg-white p-4 text-sm md:text-base font-bold placeholder:text-black/30 focus:outline-none focus:bg-[#FFD93D] focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-100 resize-none font-mono leading-relaxed"
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          className="h-14 w-full border-4 border-black bg-white px-4 text-lg font-bold placeholder:text-black/30 focus:outline-none focus:bg-[#FFD93D] focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-100"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default NeoInput;
