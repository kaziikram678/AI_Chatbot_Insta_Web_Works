import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insta Web Works Chat',
  robots: 'noindex, nofollow',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-transparent">{children}</body>
    </html>
  );
}
