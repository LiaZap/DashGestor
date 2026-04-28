import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { GlassCard } from '../ui/GlassCard';
import type { Campaign, AccountInfo } from '../../data/mockData';
import styles from './OrcamentoPage.module.css';

function fmt(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function percentColor(pct: number): string {
  if (pct > 90) return styles.percentRed;
  if (pct >= 70) return styles.percentYellow;
  return styles.percentGreen;
}

function barColor(pct: number): string {
  if (pct > 90) return '#ef4444';
  if (pct >= 70) return '#eab308';
  return '#22c55e';
}

interface OrcamentoPageProps {
  campaigns: Campaign[];
  accountInfo?: AccountInfo | null;
}

export function OrcamentoPage({ campaigns, accountInfo }: OrcamentoPageProps) {
  const totalDailyBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  // Saldo disponível vem da conta Meta (balance) - já convertido de centavos no hook
  const saldoDisponivel = accountInfo ? accountInfo.balance : 0;

  // Platform budget breakdown
  const platformBudget = useMemo(() => {
    const meta = campaigns.filter(c => c.platform === 'meta');
    const google = campaigns.filter(c => c.platform === 'google');
    return [
      { label: 'Meta Ads', spent: meta.reduce((s, c) => s + c.spent, 0), total: meta.reduce((s, c) => s + c.budget, 0), color: '#6366f1' },
      { label: 'Google Ads', spent: google.reduce((s, c) => s + c.spent, 0), total: google.reduce((s, c) => s + c.budget, 0), color: '#10b981' },
    ].filter(p => p.total > 0);
  }, [campaigns]);

  // Budget allocation by objective
  const objectiveAllocation = useMemo(() => {
    const map = new Map<string, number>();
    campaigns.forEach((c) => {
      map.set(c.objective, (map.get(c.objective) ?? 0) + c.budget);
    });
    const colors: Record<string, string> = {
      'Conversão': '#6366f1',
      'Tráfego': '#10b981',
      'Brand': '#06b6d4',
      'Remarketing': '#8b5cf6',
      'Engajamento': '#f59e0b',
      'OUTCOME_LEADS': '#6366f1',
      'OUTCOME_TRAFFIC': '#10b981',
      'OUTCOME_AWARENESS': '#06b6d4',
      'OUTCOME_ENGAGEMENT': '#f59e0b',
      'OUTCOME_SALES': '#8b5cf6',
    };
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      color: colors[name] ?? '#888',
    }));
  }, [campaigns]);

  // Projected vs actual spend over 30 days
  const projectedData = useMemo(() => {
    const dailyBudget = totalDailyBudget > 0 ? totalDailyBudget : 1;
    const dailyActual = totalSpent > 0 ? totalSpent / 30 : 1;
    return Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const noise = 0.85 + Math.sin(day * 0.7) * 0.15 + (day % 7 < 2 ? -0.1 : 0.05);
      return {
        day: `Dia ${day}`,
        projetado: Math.round(dailyBudget * day),
        real: day <= 22
          ? Math.round(dailyActual * day * noise)
          : null,
      };
    });
  }, [totalDailyBudget, totalSpent]);

  const statusLabel: Record<string, string> = {
    active: 'Ativo',
    paused: 'Pausado',
    ended: 'Encerrado',
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className={styles.title}>Orçamento</div>
        <div className={styles.subtitle}>Controle financeiro</div>
      </motion.div>

      {/* KPI Row */}
      <div className={styles.kpiRow}>
        <GlassCard delay={0.05} padding="14px">
          <div className={styles.kpiLabel}>Orçamento Diário</div>
          <div className={styles.kpiValueGold}>{fmt(totalDailyBudget)}</div>
        </GlassCard>
        <GlassCard delay={0.1} padding="14px">
          <div className={styles.kpiLabel}>Total Gasto</div>
          <div className={styles.kpiValueRed}>{fmt(totalSpent)}</div>
        </GlassCard>
        <GlassCard delay={0.15} padding="14px">
          <div className={styles.kpiLabel}>Saldo na Conta</div>
          <div className={styles.kpiValueGreen}>
            {fmt(saldoDisponivel)}
          </div>
          {accountInfo && accountInfo.spendCap > 0 && (
            <div className={styles.kpiSub}>Limite: {fmt(accountInfo.spendCap)}</div>
          )}
        </GlassCard>
      </div>

      {/* Two-column: Platform bars + Pie chart */}
      <div className={styles.twoColGrid}>
        {/* Platform budget consumption */}
        <GlassCard delay={0.2} padding="16px">
          <div className={styles.cardTitle}>Consumo por Plataforma</div>
          <div className={styles.platformBars}>
            {platformBudget.map((item, i) => {
              const pct = item.total > 0 ? (item.spent / item.total) * 100 : 0;
              return (
                <div key={item.label} className={styles.platformItem}>
                  <div className={styles.platformInfo}>
                    <span className={styles.platformLabel}>{item.label}</span>
                    <span className={styles.platformValues}>
                      {fmt(item.spent)} / {fmt(item.total)}
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <motion.div
                      className={styles.barFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 1.2,
                        delay: 0.4 + i * 0.15,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      style={{ background: barColor(pct) }}
                    />
                  </div>
                  <span className={`${styles.platformPercent} ${percentColor(pct)}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Pie chart: budget allocation by objective */}
        <GlassCard delay={0.25} padding="16px">
          <div className={styles.cardTitle}>Alocação por Objetivo</div>
          <div className={styles.pieWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={objectiveAllocation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                >
                  {objectiveAllocation.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => fmt(Number(value))}
                  contentStyle={{
                    background: '#141414',
                    border: '1px solid rgba(255,215,0,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Campaigns budget table */}
      <GlassCard delay={0.3} padding="16px">
        <div className={styles.cardTitle}>Orçamento por Campanha</div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Plataforma</th>
                <th>Orç. Diário</th>
                <th>Gasto (período)</th>
                <th>Gasto/dia (média)</th>
                <th>% vs Diário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                // Média de gasto diário vs orçamento diário
                const avgDailySpend = c.spent > 0 ? c.spent / 7 : 0; // approximate from period
                const pct = c.budget > 0 ? (avgDailySpend / c.budget) * 100 : 0;
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>
                      <span
                        className={`${styles.platformBadge} ${
                          c.platform === 'meta' ? styles.platformMeta : styles.platformGoogle
                        }`}
                      >
                        {c.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
                      </span>
                    </td>
                    <td>{fmt(c.budget)}</td>
                    <td>{fmt(c.spent)}</td>
                    <td>{fmt(avgDailySpend)}</td>
                    <td>
                      <div className={styles.cellBar}>
                        <div className={styles.cellBarTrack}>
                          <motion.div
                            className={styles.cellBarFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                            style={{ background: barColor(pct) }}
                          />
                        </div>
                        <span
                          className={styles.cellBarPercent}
                          style={{ color: barColor(pct) }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          c.status === 'active'
                            ? styles.statusActive
                            : c.status === 'paused'
                              ? styles.statusPaused
                              : styles.statusEnded
                        }`}
                      >
                        {statusLabel[c.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Projected vs Actual line chart */}
      <GlassCard delay={0.35} padding="16px">
        <div className={styles.cardTitle}>Projeção de Gastos (30 dias)</div>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                }
              />
              <Tooltip
                formatter={(value) => fmt(Number(value))}
                contentStyle={{
                  background: '#141414',
                  border: '1px solid rgba(255,215,0,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
              />
              <Line
                type="monotone"
                dataKey="projetado"
                stroke="#ffd700"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                name="Projetado"
              />
              <Line
                type="monotone"
                dataKey="real"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Real"
                connectNulls={false}
              />
              <Legend
                iconType="line"
                iconSize={14}
                wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
