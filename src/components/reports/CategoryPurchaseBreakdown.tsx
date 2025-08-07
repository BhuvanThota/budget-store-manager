// src/components/reports/CategoryPurchaseBreakdown.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BreakdownItem = {
  name: string;
  totalQuantity: number;
  totalCost: number;
};

interface CategoryPurchaseBreakdownProps {
  breakdown: BreakdownItem[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
};

export default function CategoryPurchaseBreakdown({ breakdown }: CategoryPurchaseBreakdownProps) {
    if (!breakdown || breakdown.length === 0) {
        return (
            <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Purchases by Category</h3>
                <p className="text-sm text-gray-500 p-4 border rounded-lg bg-white">No category purchase data for this period.</p>
            </div>
        );
    }
  
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">Purchases by Category</h3>
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity Purchased</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.map((category) => (
              <TableRow key={category.name}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-right">{category.totalQuantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(category.totalCost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}