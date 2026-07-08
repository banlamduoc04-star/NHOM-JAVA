type SearchProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function Search({ value, onChange, placeholder = 'Tìm kiếm...' }: SearchProps) {
    return <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}