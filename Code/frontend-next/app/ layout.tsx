import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SEAL Hackathon",
    description: "Software Engineering Hackathon Management System",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}