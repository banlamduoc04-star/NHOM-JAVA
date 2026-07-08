import type { ReactNode } from 'react';

type DashboardCardProps = {
    label: ReactNode;
    value: ReactNode;
    note?: ReactNode;
};

export default function DashboardCard({ label, value, note }: DashboardCardProps) {
    return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}