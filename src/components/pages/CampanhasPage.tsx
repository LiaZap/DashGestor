import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { exportToCSV, exportToPDF } from '../../utils/exportReport';
import type { Campaign } from '../../data/mockData';
import styles from './CampanhasPage.module.css';

interface Props {
  campaigns: Campaign[];
}

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

const PDF_COLUMNS = [
  'Campanha', 'Plataforma', 'Status', 'Objetivo', 'Orçamento', 'Gasto',
  'Impressões', 'Cliques', 'CTR', 'Conversões', 'CPA', 'ROAS',
];

function campaignsToExportRows(data: Campaign[]): Record<string, unknown>[] {
  return data.map((c) => ({
    Campanha: c.name,
    Plataforma: c.platform === 'meta' ? 'Meta' : 'Google',
    Status: c.status === 'active' ? 'Ativa' : c.status === 'paused' ? 'Pausada' : 'Finalizada',
    Objetivo: c.objective,
    'Orçamento': formatCurrency(c.budget),
    Gasto: formatCurrency(c.spent),
    'Impressões': c.impressions.toLocaleString('pt-BR'),
    Cliques: c.clicks.toLocaleString('pt-BR'),
    CTR: `${c.ctr.toFixed(2).replace('.', ',')}%`,
    'Conversões': c.conversions.toLocaleString('pt-BR'),
    CPA: formatCurrency(c.cpa),
    ROAS: `${c.roas.toFixed(2).replace('.', ',')}x`,
  }));
}

export function CampanhasPage({ campaigns }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'meta' | 'google'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');
  const [objectiveFilter, setObjectiveFilter] = useState<string>('all');
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    if (exportOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportOpen]);

  const objectives = useMemo(
    () => [...new Set(campaigns.map((c) => c.objective))],
    [campaigns],
  );

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (objectiveFilter !== 'all' && c.objective !== objectiveFilter) return false;
      return true;
    });
  }, [campaigns, searchQuery, platformFilter, statusFilter, objectiveFilter]);

  const totalCount = campaigns.length;
  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const pausedCount = campaigns.filter((c) => c.status === 'paused').length;
  const endedCount = campaigns.filter((c) => c.status === 'ended').length;

  const roasClass = (roas: number) => {
    if (roas > 5) return styles.roasHigh;
    if (roas >= 3) return styles.roasMid;
    return styles.roasLow;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.pageHeader}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className={styles.pageTitle}>Campanhas</h1>
          <p className={styles.pageSubtitle}>Gestão e acompanhamento</p>
        </div>
        <div className={styles.exportWrapper} ref={exportRef}>
          <button
            className={styles.exportBtn}
            onClick={() => setExportOpen((v) => !v)}
          >
            <Download size={14} />
            <span>Exportar</span>
          </button>
          {exportOpen && (
            <div className={styles.exportDropdown}>
              <button
                className={styles.exportDropdownItem}
                onClick={() => {
                  setExportOpen(false);
                  exportToCSV(campaignsToExportRows(filtered), 'campanhas');
                }}
              >
                <FileSpreadsheet size={14} />
                Exportar CSV
              </button>
              <button
                className={styles.exportDropdownItem}
                onClick={() => {
                  setExportOpen(false);
                  exportToPDF('Detalhamento de Campanhas', campaignsToExportRows(filtered), PDF_COLUMNS);
                }}
              >
                <FileText size={14} />
                Exportar PDF
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className={styles.statsRow}>
        <GlassCard delay={0.05} hover={false}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total de Campanhas</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.1} hover={false}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              <span className={`${styles.statusDot} ${styles.active}`} />
              Ativas
            </span>
            <span className={styles.statValue}>{activeCount}</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.15} hover={false}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              <span className={`${styles.statusDot} ${styles.paused}`} />
              Pausadas
            </span>
            <span className={styles.statValue}>{pausedCount}</span>
          </div>
        </GlassCard>
        <GlassCard delay={0.2} hover={false}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              <span className={`${styles.statusDot} ${styles.ended}`} />
              Finalizadas
            </span>
            <span className={styles.statValue}>{endedCount}</span>
          </div>
        </GlassCard>
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <GlassCard padding="14px 16px" hover={false}>
          <div className={styles.filtersRow}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar campanha..."
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
                onChange={(e) => setPlatformFilter(e.target.value as 'all' | 'meta' | 'google')}
              >
                <option value="all">Todas Plataformas</option>
                <option value="meta">Meta</option>
                <option value="google">Google</option>
              </select>

              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused' | 'ended')}
              >
                <option value="all">Todos Status</option>
                <option value="active">Ativa</option>
                <option value="paused">Pausada</option>
                <option value="ended">Finalizada</option>
              </select>

              <select
                className={styles.filterSelect}
                value={objectiveFilter}
                onChange={(e) => setObjectiveFilter(e.target.value)}
              >
                <option value="all">Todos Objetivos</option>
                {objectives.map((obj) => (
                  <option key={obj} value={obj}>{obj}</option>
                ))}
              </select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
      >
        <GlassCard padding="0">
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              Detalhamento de Campanhas
            </h3>
            <span className={styles.tableCount}>
              {filtered.length} campanha{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Campanha</th>
                  <th>Plataforma</th>
                  <th>Objetivo</th>
                  <th>Orçamento</th>
                  <th>Gasto</th>
                  <th>Impressões</th>
                  <th>Cliques</th>
                  <th>CTR</th>
                  <th>Conversões</th>
                  <th>CPA</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.03 }}
                    className={i % 2 === 1 ? styles.altRow : undefined}
                  >
                    <td>
                      <span className={`${styles.statusDot} ${styles[c.status]}`} />
                    </td>
                    <td>
                      <span className={styles.campaignName}>{c.name}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[c.platform]}`}>
                        {c.platform === 'meta' ? 'Meta' : 'Google'}
                      </span>
                    </td>
                    <td className={styles.objectiveCell}>{c.objective}</td>
                    <td>{formatCurrency(c.budget)}</td>
                    <td>{formatCurrency(c.spent)}</td>
                    <td>{formatCompact(c.impressions)}</td>
                    <td>{formatCompact(c.clicks)}</td>
                    <td>{c.ctr.toFixed(2).replace('.', ',')}%</td>
                    <td>{c.conversions.toLocaleString('pt-BR')}</td>
                    <td>{formatCurrency(c.cpa)}</td>
                    <td>
                      <span className={roasClass(c.roas)}>
                        {c.roas.toFixed(2).replace('.', ',')}x
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className={styles.emptyState}>
                      Nenhuma campanha encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
