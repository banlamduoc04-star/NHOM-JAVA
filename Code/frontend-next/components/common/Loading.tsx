type LoadingProps = {
    text?: string;
};

export default function Loading({ text = 'Đang tải dữ liệu...' }: LoadingProps) {
    return <div className="notice">{text}</div>;
}