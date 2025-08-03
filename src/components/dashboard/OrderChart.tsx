// src/components/dashboard/OrderChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartData {
  date: string;
  orders: number;
}

export default function OrderChart({ data }: { data: ChartData[] }) {
  const formattedData = data.map(item => ({
    ...item,
    // Format date for display on the X-axis
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
       <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders (Last 30 Days)</h3>
       <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
                dataKey="date" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
            />
            <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
            />
            <Tooltip
                contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '12px'
                }}
            />
            <Line type="monotone" dataKey="orders" stroke="#3D74B6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
       </div>
    </div>
  );
}