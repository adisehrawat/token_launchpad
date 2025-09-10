import React from 'react';

interface LabelProps {
    htmlFor: string;
    className?: string;
    children: React.ReactNode;
    [key: string]: unknown;
}

const Label = ({ htmlFor, className, children, ...props }: LabelProps) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-slate-200 mb-2 ${className}`} {...props}>
        {children}
    </label>
);

export default Label;
