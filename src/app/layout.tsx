import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'GreyVerse', description: 'GreyVerse gaming and esports hub' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
