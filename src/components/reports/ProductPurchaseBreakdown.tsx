// src/components/reports/ProductPurchaseBreakdown.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BreakdownItem = {
  productName: string;
  totalQuantity: number;
  totalCost: number;
};

interface ProductPurchaseBreakdownProps {
  breakdown: BreakdownItem[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
};

export default function ProductPurchaseBreakdown({ breakdown }: ProductPurchaseBreakdownProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">Product Purchase Details</h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity Purchased</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.map((product) => (
              <TableRow key={product.productName}>
                <TableCell className="font-medium">{product.productName}</TableCell>
                <TableCell className="text-right">{product.totalQuantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(product.totalCost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}