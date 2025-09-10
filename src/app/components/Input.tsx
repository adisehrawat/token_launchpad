import React from 'react';

interface InputProps {
    id: string;
    placeholder: string;
    className?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxLength?: number;
    [key: string]: unknown;
}

const Input = ({ id, placeholder, className, value, onChange, maxLength, ...props }: InputProps) => (
    <input
        id={id}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all ${className}`}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...props}
    />
);

export default Input;
