import type { Metadata } from 'next';
import './globals.css';
import OnlineGate from './online-gate';

export const metadata: Metadata = { title: 'GreyVerse', description: 'GreyVerse gaming and esports hub' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><OnlineGate>{children}</OnlineGate></body></html>;
}
