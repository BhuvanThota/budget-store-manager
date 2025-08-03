// src/components/charts/SalesBarChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface SalesBarChartProps {
  data: ChartData[];
  fillColor: string;
}

export default function SalesBarChart({ data, fillColor }: SalesBarChartProps) {
  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`} 
          />
          <Tooltip
            cursor={{ fill: 'rgba(234, 200, 166, 0.2)' }}
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '12px',
              color: '#334155'
            }}
          />
          <Bar dataKey="value" fill={fillColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}