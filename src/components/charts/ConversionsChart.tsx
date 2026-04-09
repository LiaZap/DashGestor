import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
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
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipDot} style={{ background: '#ffd700' }} />
        <span className={styles.tooltipLabel}>Conversões</span>
        <span className={styles.tooltipValue}>{payload[0].value}</span>
      </div>
    </div>
  );
}

export function ConversionsChart({ data }: Props) {
  return (
    <GlassCard delay={0.25}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conversões por Dia</h3>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBarGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd700" stopOpacity={1} />
                <stop offset="100%" stopColor="#f5a623" stopOpacity={0.7} />
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
              tickMargin={4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="conversions"
              fill="url(#gradBarGold)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
