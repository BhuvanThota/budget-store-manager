// src/app/orders/layout.tsx
import Navbar from '@/components/Navbar';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar pageTitle="Order History" />
      <main>{children}</main>
    </div>
  );
}