import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import type { Campaign } from '../../data/mockData';
import styles from './BudgetCard.module.css';

interface BudgetCardProps {
  campaigns: Campaign[];
}

export function BudgetCard({ campaigns }: BudgetCardProps) {
  const bars = useMemo(() => {
    const meta = campaigns.filter(c => c.platform === 'meta');
    const google = campaigns.filter(c => c.platform === 'google');
    const metaSpent = meta.reduce((s, c) => s + c.spent, 0);
    const metaBudget = meta.reduce((s, c) => s + c.budget, 0);
    const googleSpent = google.reduce((s, c) => s + c.spent, 0);
    const googleBudget = google.reduce((s, c) => s + c.budget, 0);

    const items = [];
    if (metaBudget > 0) items.push({ label: 'Meta Ads', spent: metaSpent, total: metaBudget, color: '#6366f1' });
    if (googleBudget > 0) items.push({ label: 'Google Ads', spent: googleSpent, total: googleBudget, color: '#10b981' });

    const totalSpent = metaSpent + googleSpent;
    const totalBudget = metaBudget + googleBudget;
    if (totalBudget > 0) items.push({ label: 'Total', spent: totalSpent, total: totalBudget, color: '#f59e0b' });

    return items;
  }, [campaigns]);

  return (
    <GlassCard delay={0.45}>
      <h3 className={styles.title}>Consumo do Orçamento</h3>
      <div className={styles.bars}>
        {bars.map((item, i) => {
          const percent = item.total > 0 ? (item.spent / item.total) * 100 : 0;
          return (
            <div key={item.label} className={styles.barItem}>
              <div className={styles.barInfo}>
                <span className={styles.barLabel}>{item.label}</span>
                <span className={styles.barValues}>
                  {item.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  {' / '}
                  {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className={styles.barTrack}>
                <motion.div
                  className={styles.barFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.2, delay: 0.5 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                  }}
                />
              </div>
              <span className={styles.barPercent}>{percent.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
