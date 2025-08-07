// src/components/reports/CategorySalesChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ReportData as SalesReportData } from '@/types/report';

interface CategorySalesChartProps {
  data: SalesReportData['categorySales'];
}

const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export default function CategorySalesChart({ data }: CategorySalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Sales by Category</h3>
        <p className="text-sm text-gray-500 p-4 border rounded-lg bg-white">No category sales data for this period.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">Sales by Category</h3>
      <div className="p-4 border rounded-lg bg-white" style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              interval={0}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => formatCurrency(value as number)}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="revenue" fill="#3D74B6" name="Revenue" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" fill="#34D399" name="Profit" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}