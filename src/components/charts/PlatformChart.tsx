import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import styles from './Charts.module.css';

interface PlatformData {
  name: string;
  value: number;
  spent: number;
}

interface Props {
  data: PlatformData[];
}

const COLORS = ['#ffd700', '#00d26a'];

export function PlatformChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.spent, 0);

  return (
    <GlassCard delay={0.2}>
      <div className={styles.header}>
        <h3 className={styles.title}>Demográficos</h3>
      </div>
      <div className={styles.chartContainer} style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as PlatformData;
                return (
                  <div className={styles.tooltip}>
                    <p className={styles.tooltipDate}>{d.name}</p>
                    <div className={styles.tooltipRow}>
                      <span className={styles.tooltipLabel}>Investimento</span>
                      <span className={styles.tooltipValue}>
                        {d.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className={styles.tooltipRow}>
                      <span className={styles.tooltipLabel}>Participação</span>
                      <span className={styles.tooltipValue}>{d.value}%</span>
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.donutCenter}>
          <span className={styles.donutCenterValue}>
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </span>
          <span className={styles.donutCenterLabel}>Total</span>
        </div>
      </div>
      <div className={styles.platformLegend}>
        {data.map((d, i) => (
          <div key={d.name} className={styles.platformLegendItem}>
            <span className={styles.legendDot} style={{ background: COLORS[i] }} />
            <span>{d.name}</span>
            <span className={styles.platformLegendValue}>{d.value}%</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
