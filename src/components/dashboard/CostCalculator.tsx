// src/components/dashboard/CostCalculator.tsx
'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function CostCalculator() {
  const [calcCost, setCalcCost] = useState('');
  const [calcItems, setCalcItems] = useState('');

  const costPerItem = parseFloat(calcCost) > 0 && parseInt(calcItems) > 0
    ? parseFloat(calcCost) / parseInt(calcItems)
    : 0;

  const profitMargins = [
    { label: '20% Profit', value: costPerItem * 1.20 },
    { label: '50% Profit', value: costPerItem * 1.50 },
    { label: '100% Profit (2x)', value: costPerItem * 2.00 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Calculator size={20} /> Quick Cost Calculator
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="calcCost" className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₹)</label>
          <input type="number" id="calcCost" value={calcCost} onChange={(e) => setCalcCost(e.target.value)} placeholder="e.g., 1000" className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="calcItems" className="block text-sm font-medium text-gray-700 mb-1"># of Items</label>
          <input type="number" id="calcItems" value={calcItems} onChange={(e) => setCalcItems(e.target.value)} placeholder="e.g., 100" className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      {costPerItem > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Cost per item: <span className="font-bold text-brand-primary">₹{costPerItem.toFixed(2)}</span></p>
          <h4 className="text-md font-semibold text-gray-800 mb-2">Suggested Sell Prices:</h4>
          <ul className="space-y-1 text-sm">
            {profitMargins.map(margin => (
              <li key={margin.label} className="flex justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-gray-700">{margin.label}:</span>
                <span className="font-bold text-green-600">₹{margin.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}