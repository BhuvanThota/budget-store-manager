// src/app/reports/layout.tsx
import Navbar from '@/components/Navbar';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar pageTitle="Reports" />
      <main>{children}</main>
    </div>
  );
}