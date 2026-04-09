import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { Campaign } from '../../data/mockData';
import styles from './TopCampaigns.module.css';

interface Props {
  campaigns: Campaign[];
}

export function TopCampaigns({ campaigns }: Props) {
  const top5 = [...campaigns]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 5);

  return (
    <GlassCard delay={0.35}>
      <div className={styles.header}>
        <h3 className={styles.title}>Top Campanhas por ROAS</h3>
        <Trophy size={16} className={styles.trophyIcon} />
      </div>
      <div className={styles.list}>
        {top5.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#555', fontSize: 13 }}>
            Nenhuma campanha encontrada
          </div>
        )}
        {top5.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            className={styles.item}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.4 + i * 0.06 }}
            whileHover={{ x: 4 }}
          >
            <div className={styles.rank}>
              {i + 1}
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{campaign.name}</span>
              <span className={`${styles.platform} ${styles[campaign.platform]}`}>
                {campaign.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
              </span>
            </div>
            <div className={styles.roasValue}>
              {campaign.roas.toFixed(2)}x
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
