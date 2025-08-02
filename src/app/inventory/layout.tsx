// src/app/inventory/layout.tsx
import Navbar from '@/components/Navbar';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a Server Component by default.
  // It can be async and fetch data.
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar pageTitle="Inventory" />
      <main>{children}</main>
    </div>
  );
}