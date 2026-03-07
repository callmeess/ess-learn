interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, color = '#6366f1', size = 'sm' }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={`w-full bg-gray-800 rounded-full ${h} overflow-hidden`}>
      <div
        className={`${h} rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}
