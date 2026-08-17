import React from 'react';
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
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  received: '#94a3b8',
  in_progress: '#60a5fa',
  qc_review: '#fbbf24',
  completed: '#34d399',
  rejected: '#f87171'
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

interface StatusBarChartProps {
  data: { status: string; count: number }[];
}

export function StatusBarChart({ data }: StatusBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="status" 
            tickFormatter={formatStatus}
            stroke="#a1a1aa"
            tick={{ fill: '#a1a1aa' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#a1a1aa"
            tick={{ fill: '#a1a1aa' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#27272a', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }}
            labelFormatter={(label) => formatStatus(String(label))}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#a1a1aa'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  water: '#60a5fa',
  food: '#fbbf24',
  soil: '#34d399'
};

interface TypePieChartProps {
  data: { type: string; count: number }[];
}

export function TypePieChart({ data }: TypePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[300px] w-full relative"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5' }}
            itemStyle={{ color: '#f4f4f5' }}
          />
          <Legend wrapperStyle={{ color: '#a1a1aa' }} />
          <Pie
            data={data}
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            dataKey="count"
            nameKey="type"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type.toLowerCase()] || '#a1a1aa'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
        <span className="text-3xl font-bold text-surface-100">{total}</span>
        <span className="text-xs text-surface-400 uppercase tracking-wider">Total</span>
      </div>
    </motion.div>
  );
}
