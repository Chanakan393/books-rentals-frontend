// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar'; // <--- เพิ่มบรรทัดนี้

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ระบบยืม-คืนหนังสือ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Navbar /> {/* <--- วาง Navbar ตรงนี้ */}
        {children}
      </body>
    </html>
  );
}