import type { Key, ReactNode } from 'react';

type TableRow = Record<string, any>;

export type DataTableColumn = {
    title: string;
    key?: string;
    render?: (row: TableRow, index: number) => ReactNode;
};

type DataTableProps = {
    columns?: DataTableColumn[];
    data?: TableRow[];
    rowKey?: string | ((row: TableRow, index: number) => Key);
    emptyText?: string;
};

export default function DataTable({ columns = [], data = [], rowKey = 'id', emptyText = 'Chưa có dữ liệu' }: DataTableProps) {
    return (
        <div className="table-card">
            <table className="table">
                <thead><tr>{columns.map((c) => <th key={c.key || c.title}>{c.title}</th>)}</tr></thead>
                <tbody>
                {data.length === 0 && <tr><td colSpan={columns.length}>{emptyText}</td></tr>}
                {data.map((row, index) => (
                    <tr key={typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey] || index}>
                        {columns.map((c) => <td key={c.key || c.title}>{c.render ? c.render(row, index) : row[c.key || '']}</td>)}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}