import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
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
            {(entry.value as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PerformanceChart({ data }: Props) {
  return (
    <GlassCard delay={0.15}>
      <div className={styles.header}>
        <h3 className={styles.title}>Linha do Tempo</h3>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#ffd700' }} /> Investimento
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#00d26a' }} /> Receita
          </span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradInvest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd700" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ffd700" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d26a" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00d26a" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              stroke="transparent"
              tick={{ fill: '#5a5a5a', fontSize: 11, fontFamily: 'Inter' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tickMargin={4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="investment"
              name="Investimento"
              stroke="#ffd700"
              strokeWidth={2.5}
              fill="url(#gradInvest)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#0a0a0a', fill: '#ffd700' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Receita"
              stroke="#00d26a"
              strokeWidth={2.5}
              fill="url(#gradRevenue)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#0a0a0a', fill: '#00d26a' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
