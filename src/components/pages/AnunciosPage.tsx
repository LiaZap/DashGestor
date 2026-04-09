import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Image, Video, LayoutGrid, Type, ShoppingBag, Layers } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { Campaign } from '../../data/mockData';
import styles from './AnunciosPage.module.css';

type Platform = 'meta' | 'google';
type Status = 'active' | 'paused';
type AdType = 'carousel' | 'video' | 'image' | 'text' | 'shopping' | 'responsive';
type SortKey = 'roas' | 'ctr' | 'impressions' | 'conversions';

interface Ad {
  id: string;
  name: string;
  campaign: string;
  platform: Platform;
  status: Status;
  type: AdType;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roas: number;
}

function guessAdType(campaign: Campaign): AdType {
  const name = campaign.name.toLowerCase();
  if (name.includes('shopping') || name.includes('catálogo')) return 'shopping';
  if (name.includes('pmax') || name.includes('performance max')) return 'responsive';
  if (name.includes('video') || name.includes('reels') || name.includes('stories')) return 'video';
  if (name.includes('carrossel') || name.includes('carousel')) return 'carousel';
  if (name.includes('search') || name.includes('texto')) return 'text';
  return 'image';
}

function campaignsToAds(campaigns: Campaign[]): Ad[] {
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    campaign: c.name,
    platform: c.platform,
    status: c.status === 'ended' ? 'paused' as const : c.status,
    type: guessAdType(c),
    impressions: c.impressions,
    clicks: c.clicks,
    ctr: c.ctr,
    conversions: c.conversions,
    cpa: c.cpa,
    roas: c.roas,
  }));
}

const typeGradients: Record<AdType, string> = {
  carousel: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  video: 'linear-gradient(135deg, #ef4444, #f97316)',
  image: 'linear-gradient(135deg, #06b6d4, #10b981)',
  text: 'linear-gradient(135deg, #ffd700, #f5a623)',
  shopping: 'linear-gradient(135deg, #00d26a, #06b6d4)',
  responsive: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
};

const typeIcons: Record<AdType, typeof Image> = {
  image: Image,
  video: Video,
  carousel: LayoutGrid,
  text: Type,
  shopping: ShoppingBag,
  responsive: Layers,
};

const typeLabels: Record<AdType, string> = {
  image: 'Imagem',
  video: 'Video',
  carousel: 'Carrossel',
  text: 'Texto',
  shopping: 'Shopping',
  responsive: 'Responsivo',
};

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function roasClass(roas: number): string {
  if (roas > 5) return styles.roasHigh;
  if (roas >= 3) return styles.roasMid;
  return styles.roasLow;
}

interface AnunciosPageProps {
  campaigns: Campaign[];
}

export function AnunciosPage({ campaigns }: AnunciosPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [sortBy, setSortBy] = useState<SortKey>('roas');

  const ads = useMemo(() => campaignsToAds(campaigns), [campaigns]);

  const filtered = useMemo(() => {
    const result = ads.filter((ad) => {
      if (searchQuery && !ad.name.toLowerCase().includes(searchQuery.toLowerCase()) && !ad.campaign.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (platformFilter !== 'all' && ad.platform !== platformFilter) return false;
      if (statusFilter !== 'all' && ad.status !== statusFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'roas': return b.roas - a.roas;
        case 'ctr': return b.ctr - a.ctr;
        case 'impressions': return b.impressions - a.impressions;
        case 'conversions': return b.conversions - a.conversions;
        default: return 0;
      }
    });

    return result;
  }, [ads, searchQuery, platformFilter, statusFilter, sortBy]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.pageHeader}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={styles.pageTitle}>Anuncios</h1>
        <p className={styles.pageSubtitle}>Visualizacao e performance dos criativos</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard padding="14px 16px" hover={false}>
          <div className={styles.filtersRow}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar anuncio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <Filter size={14} className={styles.filterIcon} />

              <select
                className={styles.filterSelect}
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as 'all' | Platform)}
              >
                <option value="all">Todas</option>
                <option value="meta">Meta</option>
                <option value="google">Google</option>
              </select>

              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | Status)}
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
              </select>

              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
              >
                <option value="roas">ROAS</option>
                <option value="ctr">CTR</option>
                <option value="impressions">Impressoes</option>
                <option value="conversions">Conversoes</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Ad Cards Grid */}
      <div className={styles.grid}>
        {filtered.map((ad, i) => {
          const IconComponent = typeIcons[ad.type];
          return (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              className={styles.cardWrapper}
            >
              <div className={styles.card}>
                {/* Creative Preview */}
                <div
                  className={styles.preview}
                  style={{ background: typeGradients[ad.type] }}
                >
                  <IconComponent size={36} className={styles.previewIcon} />
                  <span className={styles.typeLabel}>{typeLabels[ad.type]}</span>

                  <span
                    className={`${styles.platformBadge} ${
                      ad.platform === 'meta' ? styles.platformMeta : styles.platformGoogle
                    }`}
                  >
                    {ad.platform === 'meta' ? 'META ADS' : 'GOOGLE ADS'}
                  </span>
                </div>

                {/* Ad Info */}
                <div className={styles.cardBody}>
                  <div className={styles.adHeader}>
                    <span className={`${styles.statusDot} ${styles[ad.status]}`} />
                    <span className={styles.adName}>{ad.name}</span>
                  </div>
                  <p className={styles.campaignName}>{ad.campaign}</p>

                  {/* Metrics 2x2 */}
                  <div className={styles.metricsGrid}>
                    <div className={styles.metric}>
                      <span className={styles.metricValue}>{formatNumber(ad.impressions)}</span>
                      <span className={styles.metricLabel}>Impressoes</span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricValue}>{formatNumber(ad.clicks)}</span>
                      <span className={styles.metricLabel}>Cliques</span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricValue}>{ad.ctr.toFixed(2).replace('.', ',')}%</span>
                      <span className={styles.metricLabel}>CTR</span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricValue}>{formatNumber(ad.conversions)}</span>
                      <span className={styles.metricLabel}>Conversoes</span>
                    </div>
                  </div>

                  {/* Bottom Row: CPA + ROAS */}
                  <div className={styles.bottomRow}>
                    <div className={styles.bottomMetric}>
                      <span className={styles.bottomLabel}>CPA</span>
                      <span className={styles.bottomValue}>{formatCurrency(ad.cpa)}</span>
                    </div>
                    <div className={styles.bottomMetric}>
                      <span className={styles.bottomLabel}>ROAS</span>
                      <span className={`${styles.bottomValue} ${roasClass(ad.roas)}`}>
                        {ad.roas.toFixed(2).replace('.', ',')}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <GlassCard hover={false}>
          <p className={styles.emptyState}>Nenhum anuncio encontrado.</p>
        </GlassCard>
      )}
    </div>
  );
}
