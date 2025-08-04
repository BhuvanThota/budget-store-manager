// src/app/purchase-orders/layout.tsx
import Navbar from '@/components/Navbar';

export default function PurchaseOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar pageTitle="Purchase Orders" />
      <main>{children}</main>
    </div>
  );
}