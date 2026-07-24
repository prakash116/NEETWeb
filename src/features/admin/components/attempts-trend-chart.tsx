'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from '@/lib/format';
import type { AdminAttemptsTrendPoint } from '@/types/entities';

interface TrendTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: AdminAttemptsTrendPoint }>;
}

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
      <p className="font-medium text-foreground">{formatDate(point.date, 'dd MMM yyyy')}</p>
      <p className="mt-0.5 text-slate-600 tabular-nums">
        {point.attempts} attempt{point.attempts === 1 ? '' : 's'}
      </p>
    </div>
  );
}

/** Daily completed exam attempts, last 14 days — single-hue bars. */
export function AttemptsTrendChart({ data }: { data: AdminAttemptsTrendPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(value: string) => formatDate(value, 'dd MMM')}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={30}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
          <Bar
            dataKey="attempts"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
            maxBarSize={26}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
