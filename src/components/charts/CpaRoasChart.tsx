import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartTooltipProps = { active?: boolean; payload?: any[]; label?: string };
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GlassCard } from '../ui/GlassCard';
import type { DailyMetric } from '../../data/mockData';
import styles from './Charts.module.css';

interface Props {
  data: DailyMetric[];
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>
        {format(parseISO(label as string), "dd 'de' MMM", { locale: ptBR })}
      </p>
      {payload.map((entry: { name?: string; color?: string; value?: number }) => (
        <div key={entry.name} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: entry.color }} />
          <span className={styles.tooltipLabel}>{entry.name}</span>
          <span className={styles.tooltipValue}>
            {entry.name === 'CPA'
              ? `R$ ${(entry.value as number).toFixed(2)}`
              : `${(entry.value as number).toFixed(2)}x`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CpaRoasChart({ data }: Props) {
  return (
    <GlassCard delay={0.3}>
      <div className={styles.header}>
        <h3 className={styles.title}>CPA vs ROAS</h3>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#fbbf24' }} /> CPA (R$)
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#ff4757' }} /> ROAS (x)
          </span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 215, 0, 0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => format(parseISO(d), 'dd/MM')}
              stroke="transparent"
              tick={{ fill: '#5a5a5a', fontSize: 11, fontFamily: 'Inter' }}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              stroke="transparent"
              tick={{ fill: '#5a5a5a', fontSize: 11, fontFamily: 'Inter' }}
              tickFormatter={(v) => `R$${v}`}
              tickMargin={4}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="transparent"
              tick={{ fill: '#5a5a5a', fontSize: 11, fontFamily: 'Inter' }}
              tickFormatter={(v) => `${v}x`}
              tickMargin={4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cpa"
              name="CPA"
              stroke="#fbbf24"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#fbbf24', strokeWidth: 2, stroke: '#111' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roas"
              name="ROAS"
              stroke="#ff4757"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#ff4757', strokeWidth: 2, stroke: '#111' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
