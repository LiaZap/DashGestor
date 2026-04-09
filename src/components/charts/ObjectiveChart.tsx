import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import { objectiveData } from '../../data/mockData';
import styles from './Charts.module.css';

export function ObjectiveChart() {
  return (
    <GlassCard delay={0.45}>
      <div className={styles.header}>
        <h3 className={styles.title}>Investimento por Objetivo</h3>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={objectiveData}>
            <PolarGrid stroke="rgba(255, 215, 0, 0.08)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: '#a0a0a0', fontSize: 11, fontFamily: 'Inter' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className={styles.tooltip}>
                    <p className={styles.tooltipDate}>{d.name}</p>
                    <div className={styles.tooltipRow}>
                      <span className={styles.tooltipLabel}>Participação</span>
                      <span className={styles.tooltipValue}>{d.value}%</span>
                    </div>
                  </div>
                );
              }}
            />
            <Radar
              dataKey="value"
              stroke="#ffd700"
              fill="#ffd700"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
