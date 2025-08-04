// src/components/reports/MetricCard.tsx

interface MetricCardProps {
  title: string;
  value: string;
  prefix?: string;
  bgColor?: string;
  textColor?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  prefix = "",
  bgColor = "bg-gray-50",
  textColor = "text-gray-800"
}: MetricCardProps) {
  return (
    <div className={`p-4 rounded-lg shadow-sm ${bgColor} ${textColor}`}>
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="text-lg font-bold mt-1">
        {prefix}{value}
      </p>
    </div>
  );
}