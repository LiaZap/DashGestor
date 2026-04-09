import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import type { Campaign, DailyMetric } from '../../data/mockData';
import styles from './MetaAdsPage.module.css';

interface Props {
  campaigns: Campaign[];
  dailyMetrics: DailyMetric[];
}

const PLACEMENT_DATA = [
  { name: 'Feed', value: 45, color: '#ffd700' },
  { name: 'Stories', value: 25, color: '#00d26a' },
  { name: 'Reels', value: 20, color: '#6366f1' },
  { name: 'Audience Network', value: 10, color: '#ef4444' },
];

export function MetaAdsPage({ campaigns }: Props) {
  const metaCampaigns = useMemo(
    () => campaigns.filter((c) => c.platform === 'meta'),
    [campaigns],
  );

  const kpis = useMemo(() => {
    const totalSpent = metaCampaigns.reduce((s, c) => s + c.spent, 0);
    const totalRevenue = metaCampaigns.reduce((s, c) => s + c.revenue, 0);
    const totalImpressions = metaCampaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = metaCampaigns.reduce((s, c) => s + c.clicks, 0);
    const roas = totalSpent > 0 ? totalRevenue / totalSpent : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return [
      {
        label: 'Investimento Meta',
        value: totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        change: 12.5,
      },
      {
        label: 'Receita Meta',
        value: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        change: 18.3,
      },
      {
        label: 'ROAS Meta',
        value: `${roas.toFixed(2).replace('.', ',')}x`,
        change: 8.7,
      },
      {
        label: 'CTR Meta',
        value: `${ctr.toFixed(2).replace('.', ',')}%`,
        change: -2.1,
      },
    ];
  }, [metaCampaigns]);

  const top5Campaigns = useMemo(
    () =>
      [...metaCampaigns]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((c) => ({
          name: c.name.length > 22 ? c.name.slice(0, 22) + '...' : c.name,
          revenue: c.revenue,
          spent: c.spent,
        })),
    [metaCampaigns],
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.headerSection}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className={styles.title}>Meta Ads</h2>
        <p className={styles.subtitle}>Visão geral da plataforma</p>
      </motion.div>

      {/* KPI Row */}
      <div className={styles.kpiRow}>
        {kpis.map((kpi, i) => (
          <GlassCard key={kpi.label} delay={i * 0.07} padding="14px 16px">
            <span className={styles.kpiLabel}>{kpi.label}</span>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <span
              className={`${styles.kpiChange} ${
                kpi.change >= 0 ? styles.kpiPositive : styles.kpiNegative
              }`}
            >
              {kpi.change >= 0 ? '+' : ''}
              {kpi.change}%
            </span>
          </GlassCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Bar Chart - Campaign Performance */}
        <GlassCard delay={0.3}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Top 5 Campanhas por Receita</h3>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top5Campaigns} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#5a5a5a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#5a5a5a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { name: string; revenue: number; spent: number };
                    return (
                      <div className={styles.tooltip}>
                        <p className={styles.tooltipTitle}>{d.name}</p>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>Receita</span>
                          <span className={styles.tooltipValue}>
                            {d.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipLabel}>Investido</span>
                          <span className={styles.tooltipValue}>
                            {d.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="revenue" fill="#ffd700" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pie Chart - Ad Placement Breakdown */}
        <GlassCard delay={0.35}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Distribuição por Posicionamento</h3>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={PLACEMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {PLACEMENT_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { name: string; value: number };
                    return (
                      <div className={styles.tooltip}>
                        <p className={styles.tooltipTitle}>{d.name}</p>
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
          </div>
          <div className={styles.pieLegend}>
            {PLACEMENT_DATA.map((d) => (
              <div key={d.name} className={styles.pieLegendItem}>
                <span className={styles.legendDot} style={{ background: d.color }} />
                <span>{d.name}</span>
                <span className={styles.pieLegendValue}>{d.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
      >
        <GlassCard padding="0">
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Campanhas Meta Ads</h3>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>Status</th>
                  <th>Investido</th>
                  <th>Impressões</th>
                  <th>Cliques</th>
                  <th>CTR</th>
                  <th>Conversões</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {metaCampaigns.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.04 }}
                  >
                    <td>
                      <span className={styles.campaignName}>{c.name}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusDot} ${styles[c.status]}`} />
                    </td>
                    <td>
                      {c.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td>{c.impressions.toLocaleString('pt-BR')}</td>
                    <td>{c.clicks.toLocaleString('pt-BR')}</td>
                    <td>{c.ctr.toFixed(2)}%</td>
                    <td>{c.conversions.toLocaleString('pt-BR')}</td>
                    <td>
                      <span
                        className={
                          c.roas >= 6
                            ? styles.roasHigh
                            : c.roas >= 3.5
                              ? styles.roasMid
                              : styles.roasLow
                        }
                      >
                        {c.roas.toFixed(2)}x
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
