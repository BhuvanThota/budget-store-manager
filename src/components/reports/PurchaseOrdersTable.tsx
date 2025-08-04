// src/components/reports/PurchaseOrdersTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define types for the props
type PurchaseOrderItem = { productName: string; quantityOrdered: number; costPricePerItem: number; };
type PurchaseOrder = { id: string; purchaseOrderId: number; totalAmount: number; createdAt: string; supplierDetails: string | null; items: PurchaseOrderItem[]; };
export type PaginatedPurchaseData = { purchaseOrders: PurchaseOrder[]; totalPages: number; };

interface PurchaseOrdersTableProps {
  data?: PaginatedPurchaseData;
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
}

export function PurchaseOrdersTable({ data, isLoading, page, setPage }: PurchaseOrdersTableProps) {
  // Helper functions for formatting
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Simple Tailwind CSS classes for our buttons
  const buttonClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";

  if (isLoading && !data) return <div className="text-center p-4">Loading purchase orders...</div>;
  if (!data || !data.purchaseOrders || data.purchaseOrders.length === 0) return <div className="text-center p-4 border-t mt-4 pt-4">No individual purchase orders found for this period.</div>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-700 mb-2">Recent Purchase Orders</h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.purchaseOrders.map(po => (
              <TableRow key={po.id}>
                <TableCell className="font-medium">#{po.purchaseOrderId}</TableCell>
                <TableCell>{formatDate(po.createdAt)}</TableCell>
                <TableCell>{po.supplierDetails || 'N/A'}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(po.totalAmount)}</TableCell>
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