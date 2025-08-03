// src/components/reports/MetricCard.tsx
interface MetricCardProps {
    title: string;  
    value: string;
    prefix?: string;
    bgColor: string;
    textColor: string;
}
  
export default function MetricCard({ title, value, prefix = '', bgColor, textColor }: MetricCardProps) {
    return (
    <div className={`${bgColor} p-4 rounded-lg text-center`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl md:text-lg lg:text-2xl font-bold ${textColor}`}>{prefix}{value}</p>
    </div>
    );
}