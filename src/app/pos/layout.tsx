// src/app/pos/layout.tsx
import Navbar from '@/components/Navbar';

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar pageTitle="Point of Sale" />
      <main>{children}</main>
    </div>
  );
}