import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'SEAL Hackathon - SU26SWP04',
    description: 'Hệ thống quản lý cuộc thi SEAL Hackathon ngành Kỹ thuật Phần mềm'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <html lang="vi"><body>{children}</body></html>;
}
