import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
    title: 'SEAL Hackathon - SU26SWP04',
    description: 'Hệ thống quản lý cuộc thi SEAL Hackathon'
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return <html lang="vi"><body>{children}</body></html>;
}