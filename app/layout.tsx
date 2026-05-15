import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Insta Web Works | AI Assistant',
  description: 'Zoho CRM Experts • Custom Portals • Web & Software Development',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
