import { useMemo } from 'react';
import type { Campaign, DailyMetric } from '../../data/mockData';
import { GlassCard } from '../ui/GlassCard';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './GoogleAdsPage.module.css';

interface Props {
  campaigns: Campaign[];
  dailyMetrics: DailyMetric[];
}

const campaignTypeData = [
  { name: 'Search', value: 40, color: '#00d26a' },
  { name: 'Shopping', value: 30, color: '#ffd700' },
  { name: 'Display', value: 15, color: '#6366f1' },
  { name: 'Performance Max', value: 15, color: '#06b6d4' },
];

const keywordsData = [
  { keyword: 'produto principal', impressions: 48200 },
  { keyword: 'marca oficial', impressions: 39500 },
  { keyword: 'comprar online', impressions: 31800 },
  { keyword: 'melhor preco', impressions: 24100 },
  { keyword: 'oferta do dia', impressions: 18600 },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace('.', ',')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}K`;
  return value.toLocaleString('pt-BR');
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  payload: { name?: string; keyword?: string; color?: string };
}

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{entry.payload.name}</div>
      <div className={styles.tooltipValue}>{entry.value}%</div>
    </div>
  );
}

function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{entry.payload.keyword}</div>
      <div className={styles.tooltipValue}>{formatCompact(entry.value)} impressoes</div>
    </div>
  );
}

export function GoogleAdsPage({ campaigns }: Props) {
  const googleCampaigns = useMemo(
    () => campaigns.filter((c) => c.platform === 'google'),
    [campaigns],
  );

  const kpis = useMemo(() => {
    const totalSpent = googleCampaigns.reduce((s, c) => s + c.spent, 0);
    const totalRevenue = googleCampaigns.reduce((s, c) => s + c.revenue, 0);
    const totalConversions = googleCampaigns.reduce((s, c) => s + c.conversions, 0);
    const roas = totalSpent > 0 ? totalRevenue / totalSpent : 0;
    const cpa = totalConversions > 0 ? totalSpent / totalConversions : 0;

    return {
      investimento: formatCurrency(totalSpent),
      receita: formatCurrency(totalRevenue),
      roas: `${roas.toFixed(2).replace('.', ',')}x`,
      cpa: formatCurrency(cpa),
    };
  }, [googleCampaigns]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className={styles.title}>Google Ads</h1>
        <p className={styles.subtitle}>Visao geral da plataforma</p>
      </motion.div>

      {/* KPI Row */}
      <div className={styles.kpiRow}>
        {[
          { label: 'Investimento Google', value: kpis.investimento },
          { label: 'Receita Google', value: kpis.receita },
          { label: 'ROAS Google', value: kpis.roas, accent: true },
          { label: 'CPA Google', value: kpis.cpa },
        ].map((kpi, i) => (
          <GlassCard key={kpi.label} delay={i * 0.07} padding="14px 16px">
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <div className={`${styles.kpiValue} ${kpi.accent ? styles.kpiAccent : ''}`}>
              {kpi.value}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Pie Chart - Campaign Types */}
        <GlassCard delay={0.3} padding="16px">
          <div className={styles.chartTitle}>Tipos de Campanha</div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={campaignTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="transparent"
                >
                  {campaignTypeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.pieLegend}>
            {campaignTypeData.map((entry) => (
              <div key={entry.name} className={styles.pieLegendItem}>
                <span
                  className={styles.pieLegendDot}
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
                <span className={styles.pieLegendValue}>{entry.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Bar Chart - Keywords Performance */}
        <GlassCard delay={0.38} padding="16px">
          <div className={styles.chartTitle}>Top Keywords por Impressoes</div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={keywordsData}
                layout="vertical"
                margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: '#5a5a5a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <YAxis
                  type="category"
                  dataKey="keyword"
                  tick={{ fill: '#5a5a5a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,210,106,0.05)' }} />
                <Bar
                  dataKey="impressions"
                  fill="#00d26a"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Campaigns Table */}
      <GlassCard delay={0.45} padding="0">
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>Campanhas Google Ads</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>Status</th>
                  <th>Investido</th>
                  <th>Impressoes</th>
                  <th>Cliques</th>
                  <th>CTR</th>
                  <th>Conversoes</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {googleCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <span className={styles.campaignName}>{campaign.name}</span>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <span
                          className={`${styles.statusDot} ${
                            campaign.status === 'active'
                              ? styles.active
                              : campaign.status === 'paused'
                                ? styles.paused
                                : styles.ended
                          }`}
                        />
                        <span className={styles.statusLabel}>{campaign.status}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(campaign.spent)}</td>
                    <td>{formatCompact(campaign.impressions)}</td>
                    <td>{formatCompact(campaign.clicks)}</td>
                    <td>{campaign.ctr.toFixed(2).replace('.', ',')}%</td>
                    <td>{campaign.conversions}</td>
                    <td>
                      <span
                        className={
                          campaign.roas >= 6
                            ? styles.roasHigh
                            : campaign.roas >= 4
                              ? styles.roasMid
                              : styles.roasLow
                        }
                      >
                        {campaign.roas.toFixed(2).replace('.', ',')}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
