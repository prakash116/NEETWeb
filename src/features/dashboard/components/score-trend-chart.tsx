'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface TrendPoint {
  attempt: number;
  percentage: number;
  examName: string;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: TrendPoint }>;
}

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as TrendPoint;
  return (
    <div className="rounded-lg border border-white/70 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
      <p className="max-w-48 truncate font-medium text-foreground">{point.examName}</p>
      <p className="mt-0.5 text-slate-600 tabular-nums">Score: {point.percentage}%</p>
    </div>
  );
}

/** Single-series improvement graph: score % per attempt, oldest → newest. */
export function ScoreTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="attempt"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            allowDecimals={false}
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#cbd5e1' }} />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#2563eb"
            strokeWidth={2}
            fill="#dbeafe"
            fillOpacity={0.55}
            dot={{ r: 3, fill: '#2563eb', strokeWidth: 1.5, stroke: '#ffffff' }}
            activeDot={{ r: 4.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
