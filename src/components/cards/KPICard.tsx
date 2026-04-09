import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Eye, MousePointer,
  ShoppingCart, Target, BarChart3, Percent,
} from 'lucide-react';
import type { KPI } from '../../data/mockData';
import styles from './KPICard.module.css';

const iconMap: Record<string, typeof DollarSign> = {
  DollarSign, TrendingUp, Eye, MousePointer,
  ShoppingCart, Target, BarChart3, Percent,
};

interface KPICardProps {
  kpi: KPI;
  index: number;
}

export function KPICard({ kpi, index }: KPICardProps) {
  const Icon = iconMap[kpi.icon] || BarChart3;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
    >
      <div className={styles.top}>
        <span className={styles.label}>{kpi.label}</span>
      </div>
      <div className={styles.bottom}>
        <div className={styles.iconWrap} style={{ '--kpi-color': kpi.color } as CSSProperties}>
          <Icon size={16} />
        </div>
        <div className={styles.valueCol}>
          <span className={styles.sublabel}>
            {kpi.label === 'Investimento' ? 'Total' :
             kpi.label === 'Receita' ? 'Valor' :
             kpi.label === 'ROAS' ? 'Retorno' : kpi.label}
          </span>
          <span className={styles.value}>{kpi.value}</span>
        </div>
      </div>
    </motion.div>
  );
}
