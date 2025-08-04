// src/components/dashboard/DashboardCard.tsx
import React from 'react';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardCard({ title, icon, children }: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-4">
        <div className="bg-brand-secondary/30 text-brand-primary rounded-lg p-2">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}