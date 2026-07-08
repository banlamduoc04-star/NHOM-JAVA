import type { ReactNode } from 'react';

type InputProps = Record<string, any> & {
    label: ReactNode;
    as?: keyof JSX.IntrinsicElements;
    className?: string;
};

export default function Input({ label, as = 'input', className = '', ...props }: InputProps) {
    const Tag = as as any;
    return <label className={className}>{label}<Tag {...props} /></label>;
}