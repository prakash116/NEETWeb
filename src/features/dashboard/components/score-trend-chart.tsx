'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDate, formatScore } from '@/lib/format';
import type { ExamOutcome } from '@/types/entities';

export interface TrendPoint {
  attempt: number;
  percentage: number;
  examName: string;
  score: number;
  outcome: ExamOutcome;
  submittedAt?: string;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: TrendPoint }>;
}

const OUTCOME_TEXT: Record<ExamOutcome, { label: string; className: string }> = {
  passed: { label: 'Passed', className: 'text-green-700' },
  failed: { label: 'Failed', className: 'text-red-700' },
  pending: { label: 'Pending', className: 'text-slate-500' },
};

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as TrendPoint;
  const outcome = OUTCOME_TEXT[point.outcome];
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
      <p className="max-w-52 truncate font-medium text-foreground">{point.examName}</p>
      <p className="mt-0.5 text-slate-500">
        Attempt #{point.attempt}
        {point.submittedAt ? ` · ${formatDate(point.submittedAt)}` : ''}
      </p>
      <p className="mt-1 text-slate-700 tabular-nums">
        <span className="font-semibold text-foreground">{point.percentage}%</span>
        {' · '}
        {formatScore(point.score)} marks{' · '}
        <span className={`font-medium ${outcome.className}`}>{outcome.label}</span>
      </p>
    </div>
  );
}

/**
 * Single-series improvement graph: score % per attempt, oldest → newest.
 * Linear segments (attempts are discrete events — no smoothing), a dashed
 * average reference, and a fixed 0–100% scale so progress reads honestly.
 */
export function ScoreTrendChart({ data }: { data: TrendPoint[] }) {
  const average =
    data.length > 0
      ? Math.round((data.reduce((sum, point) => sum + point.percentage, 0) / data.length) * 10) /
        10
      : 0;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 14, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="attempt"
            type="number"
            domain={[1, Math.max(2, data.length)]}
            tickCount={Math.min(10, Math.max(2, data.length))}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(value: number) => `#${value}`}
            allowDecimals={false}
            padding={{ left: 6, right: 6 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            width={42}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
          {data.length > 1 ? (
            <ReferenceLine
              y={average}
              stroke="#94a3b8"
              strokeDasharray="6 4"
              label={{
                value: `avg ${average}%`,
                position: 'insideTopRight',
                fill: '#64748b',
                fontSize: 11,
              }}
            />
          ) : null}
          <Area
            type="linear"
            dataKey="percentage"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#trendFill)"
            dot={{ r: 3.5, fill: '#2563eb', strokeWidth: 1.5, stroke: '#ffffff' }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
