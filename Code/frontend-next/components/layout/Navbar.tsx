interface NavbarProps {
    user: any;
    onLogout: () => void;
}

export default function Navbar({
                                   user,
                                   onLogout,
                               }: NavbarProps) {
    return (
        <header className="navbar">
            <h2>Dashboard</h2>

            <div style={{ display: "flex", gap: 20 }}>
                <span>Welcome {user?.fullName}</span>

                <button onClick={onLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
}