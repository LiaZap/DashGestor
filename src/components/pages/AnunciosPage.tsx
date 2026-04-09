import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Image, Video, LayoutGrid, Type, ShoppingBag, Layers } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
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

const mockAds: Ad[] = [
  { id: '1', name: 'Carrossel - Produtos Top', campaign: 'Remarketing - Carrinho Abandonado', platform: 'meta', status: 'active', type: 'carousel', impressions: 45230, clicks: 1823, ctr: 4.03, conversions: 67, cpa: 12.40, roas: 7.85 },
  { id: '2', name: 'Video 15s - Oferta Flash', campaign: 'Stories - Promoção Semanal', platform: 'meta', status: 'active', type: 'video', impressions: 32100, clicks: 1205, ctr: 3.75, conversions: 34, cpa: 15.20, roas: 4.12 },
  { id: '3', name: 'Imagem - Banner Principal', campaign: 'Brand - Institucional', platform: 'google', status: 'active', type: 'image', impressions: 67890, clicks: 2345, ctr: 3.45, conversions: 89, cpa: 10.50, roas: 8.20 },
  { id: '4', name: 'Responsive Search Ad', campaign: 'Search - Produto Principal', platform: 'google', status: 'active', type: 'text', impressions: 23456, clicks: 1890, ctr: 8.06, conversions: 45, cpa: 18.90, roas: 5.10 },
  { id: '5', name: 'Reels - UGC Review', campaign: 'Reels - Criativo A/B Test', platform: 'meta', status: 'active', type: 'video', impressions: 89000, clicks: 3200, ctr: 3.60, conversions: 42, cpa: 16.30, roas: 3.80 },
  { id: '6', name: 'Shopping - Produto A', campaign: 'Shopping - Catálogo Completo', platform: 'google', status: 'active', type: 'shopping', impressions: 56780, clicks: 2100, ctr: 3.70, conversions: 78, cpa: 11.20, roas: 7.50 },
  { id: '7', name: 'Stories - Countdown', campaign: 'Stories - Promoção Semanal', platform: 'meta', status: 'paused', type: 'video', impressions: 18900, clicks: 670, ctr: 3.54, conversions: 12, cpa: 22.10, roas: 2.30 },
  { id: '8', name: 'Display Banner 728x90', campaign: 'Display - Remarketing GDN', platform: 'google', status: 'paused', type: 'image', impressions: 145000, clicks: 890, ctr: 0.61, conversions: 15, cpa: 25.40, roas: 1.80 },
  { id: '9', name: 'Feed - Depoimento Cliente', campaign: 'Lookalike 1% - Compradores', platform: 'meta', status: 'active', type: 'image', impressions: 41200, clicks: 1560, ctr: 3.79, conversions: 55, cpa: 13.80, roas: 6.20 },
  { id: '10', name: 'PMax - Asset Group 1', campaign: 'Performance Max - Geral', platform: 'google', status: 'active', type: 'responsive', impressions: 98700, clicks: 3450, ctr: 3.50, conversions: 112, cpa: 9.80, roas: 8.90 },
  { id: '11', name: 'Carrossel - Lookbook', campaign: 'Interesse - Público Frio', platform: 'meta', status: 'active', type: 'carousel', impressions: 67800, clicks: 1890, ctr: 2.79, conversions: 28, cpa: 19.50, roas: 3.40 },
  { id: '12', name: 'Video 30s - Marca', campaign: 'Brand - Institucional', platform: 'google', status: 'active', type: 'video', impressions: 34500, clicks: 980, ctr: 2.84, conversions: 23, cpa: 21.30, roas: 2.90 },
];

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

export function AnunciosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [sortBy, setSortBy] = useState<SortKey>('roas');

  const filtered = useMemo(() => {
    const result = mockAds.filter((ad) => {
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
  }, [searchQuery, platformFilter, statusFilter, sortBy]);

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
