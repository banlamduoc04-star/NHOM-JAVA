type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (!totalPages || totalPages <= 1) return null;
    return <div className="pagination"><button className="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Trước</button><span>{page}/{totalPages}</span><button className="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Sau</button></div>;
}