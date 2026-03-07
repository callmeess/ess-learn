import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  sub?: string;
}

export default function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</span>
        <div className="text-gray-600">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
