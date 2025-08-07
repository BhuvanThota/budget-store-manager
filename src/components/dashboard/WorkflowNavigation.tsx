// src/components/dashboard/WorkflowNavigation.tsx
'use client';

import Link from 'next/link';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  PlusCircle,
  History,
  TrendingUp,
  Store
} from 'lucide-react';

interface WorkflowCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  step: number;
  color: string;
}

function WorkflowCard({ title, description, href, icon, step, color }: WorkflowCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className={`relative overflow-hidden h-full rounded-xl border border-gray-200/50 hover:border-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${color}`}>
        <div className="absolute top-4 right-4 w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-sm font-bold text-gray-700 opacity-70 group-hover:opacity-100 transition-opacity">
          {step}
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0 w-11 h-11 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function WorkflowNavigation() {
  // FINALIZED: The descriptions are now perfectly aligned with the app's features.
  const workflows = [
    {
      title: "Manage Products & Stock",
      description: "Go to the Inventory page to add new products or manage existing stock levels.",
      href: "/inventory",
      icon: <PlusCircle size={22} className="text-blue-600" />,
      step: 1,
      color: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    },
    {
      title: "Manage Purchase Orders",
      description: "Create new purchase orders and view or delete recent POs from the history tab.",
      href: "/purchase-orders",
      icon: <Package size={22} className="text-purple-600" />,
      step: 2,
      color: 'bg-gradient-to-br from-purple-50 to-violet-100',
    },
    {
      title: "Make a Sale (POS)",
      description: "Use the Point of Sale system for fast and easy customer transactions.",
      href: "/pos",
      icon: <ShoppingCart size={22} className="text-green-600" />,
      step: 3,
      color: 'bg-gradient-to-br from-green-50 to-emerald-100',
    },
    {
      title: "View Sales History",
      description: "Review your past sales transactions and order details.",
      href: "/orders",
      icon: <History size={22} className="text-teal-600" />,
      step: 4,
      color: 'bg-gradient-to-br from-teal-50 to-cyan-100',
    },
    {
      title: "Analyze Reports",
      description: "Generate detailed reports to understand profits, categories, and top sellers.",
      href: "/reports",
      icon: <BarChart3 size={22} className="text-red-600" />,
      step: 5,
      color: 'bg-gradient-to-br from-red-50 to-pink-100',
    },
    {
      title: "Shop Settings",
      description: "Configure your shop's name, owner, and other essential details.",
      href: "/shop-settings",
      icon: <Store size={22} className="text-orange-600" />,
      step: 6,
      color: 'bg-gradient-to-br from-orange-50 to-amber-100',
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-brand-text">Quick Actions & Workflow</h2>
                  <p className="text-sm text-gray-500">Get started or jump to a specific task</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.step}
            {...workflow}
          />
        ))}
      </div>
    </div>
  );
}