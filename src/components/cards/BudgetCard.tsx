import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { budgetData } from '../../data/mockData';
import styles from './BudgetCard.module.css';

export function BudgetCard() {
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const totalBudget = budgetData.reduce((s, b) => s + b.total, 0);

  const allBars = [
    ...budgetData,
    { label: 'Total', spent: totalSpent, total: totalBudget, color: '#f59e0b' },
  ];

  return (
    <GlassCard delay={0.45}>
      <h3 className={styles.title}>Consumo do Orçamento</h3>
      <div className={styles.bars}>
        {allBars.map((item, i) => {
          const percent = (item.spent / item.total) * 100;
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
