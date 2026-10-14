import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  received: 'var(--color-status-received)',
  in_progress: 'var(--color-status-in-progress)',
  qc_review: 'var(--color-status-qc-review)',
  completed: 'var(--color-status-completed)',
  rejected: 'var(--color-status-rejected)',
};

const TYPE_COLORS: Record<string, string> = {
  water: 'var(--color-status-in-progress)',
  food: 'var(--color-status-qc-review)',
  soil: 'var(--color-status-completed)',
};

const formatStatus = (status: string) => status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
const axisStyle = { fill: 'var(--color-surface-400)', fontSize: 11 };
const tooltipStyle = {
  backgroundColor: 'var(--color-surface-900)',
  border: '1px solid var(--app-border)',
  borderRadius: '10px',
  color: 'var(--color-surface-50)',
  boxShadow: 'var(--app-shadow)',
};

interface StatusBarChartProps {
  data: { status: string; count: number }[];
}

export function StatusBarChart({ data }: StatusBarChartProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.18 }} className="h-[280px] w-full pt-2 sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 14, right: 10, left: -18, bottom: 2 }}>
          <CartesianGrid strokeDasharray="3 5" stroke="var(--app-border)" vertical={false} />
          <XAxis dataKey="status" tickFormatter={formatStatus} tick={axisStyle} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: 'var(--color-primary-500)', opacity: 0.06 }} contentStyle={tooltipStyle} labelFormatter={(label) => formatStatus(String(label))} />
          <Bar dataKey="count" radius={[5, 5, 1, 1]} maxBarSize={46}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || 'var(--color-primary-500)'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

interface TypePieChartProps {
  data: { type: string; count: number }[];
}

export function TypePieChart({ data }: TypePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.18 }} className="relative h-[280px] w-full sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--color-surface-100)' }} />
          <Legend verticalAlign="bottom" height={28} iconType="circle" iconSize={8} wrapperStyle={{ color: 'var(--color-surface-400)', fontSize: '11px' }} />
          <Pie data={data} innerRadius="61%" outerRadius="82%" paddingAngle={3} dataKey="count" nameKey="type" stroke="var(--color-surface-900)" strokeWidth={3}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type.toLowerCase()] || 'var(--color-primary-500)'} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-5">
        <span className="font-heading text-[30px] font-semibold tracking-tight text-surface-50 tabular-nums">{total}</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-500">Total samples</span>
      </div>
    </motion.div>
  );
}
