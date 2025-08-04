// src/components/reports/SalesOrdersTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define types for the props
type OrderItem = { productName: string; quantity: number; soldAt: number; };
type Order = { id: string; orderId: number; totalAmount: number; createdAt: string; items: OrderItem[]; };
export type PaginatedSalesData = { orders: Order[]; totalPages: number; };

interface SalesOrdersTableProps {
  data?: PaginatedSalesData;
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
}

export function SalesOrdersTable({ data, isLoading, page, setPage }: SalesOrdersTableProps) {
  // Helper functions for formatting
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Simple Tailwind CSS classes for our buttons
  const buttonClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";

  if (isLoading && !data) return <div className="text-center p-4">Loading orders...</div>;
  if (!data || !data.orders || data.orders.length === 0) return <div className="text-center p-4 border-t mt-4 pt-4">No individual orders found for this period.</div>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-700 mb-2">Recent Sales Orders</h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.orders.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.orderId}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">{order.items.map(item => `${item.quantity} x ${item.productName}`).join(', ')}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls with simple buttons */}
      <div className="flex items-center justify-end space-x-4 py-4">
        <button className={buttonClasses} onClick={() => setPage(page - 1)} disabled={page <= 1 || isLoading}>
          Previous
        </button>
        <span className="text-sm font-medium">Page {page} of {data.totalPages}</span>
        <button className={buttonClasses} onClick={() => setPage(page + 1)} disabled={page >= data.totalPages || isLoading}>
          Next
        </button>
      </div>
    </div>
  );
}