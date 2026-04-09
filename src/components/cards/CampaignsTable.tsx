import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { exportToCSV, exportToPDF } from '../../utils/exportReport';
import type { Campaign } from '../../data/mockData';
import styles from './CampaignsTable.module.css';

interface Props {
  campaigns: Campaign[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PDF_COLUMNS = [
  'Campanha', 'Plataforma', 'Status', 'Investido', 'Impressões', 'Cliques', 'CTR', 'Conversões', 'CPA', 'ROAS',
];

function campaignsToExportRows(campaigns: Campaign[]): Record<string, unknown>[] {
  return campaigns.map((c) => ({
    Campanha: c.name,
    Plataforma: c.platform === 'meta' ? 'Meta' : 'Google',
    Status: c.status === 'active' ? 'Ativa' : c.status === 'paused' ? 'Pausada' : 'Finalizada',
    Investido: c.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    'Impressões': c.impressions.toLocaleString('pt-BR'),
    Cliques: c.clicks.toLocaleString('pt-BR'),
    CTR: `${c.ctr.toFixed(2)}%`,
    'Conversões': c.conversions.toLocaleString('pt-BR'),
    CPA: c.cpa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    ROAS: `${c.roas.toFixed(2)}x`,
  }));
}

export function CampaignsTable({ campaigns, searchQuery, onSearchChange }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleCSV = () => {
    setDropdownOpen(false);
    const rows = campaignsToExportRows(campaigns);
    exportToCSV(rows, 'campanhas');
  };

  const handlePDF = () => {
    setDropdownOpen(false);
    const rows = campaignsToExportRows(campaigns);
    exportToPDF('Campanhas Ativas', rows, PDF_COLUMNS);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
    >
      <GlassCard padding="0">
        <div className={styles.header}>
          <h3 className={styles.title}>Campanhas Ativas</h3>
          <div className={styles.actions}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar campanha..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.exportWrapper} ref={wrapperRef}>
              <button
                className={styles.exportBtn}
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <Download size={14} />
                <span>Exportar</span>
              </button>
              {dropdownOpen && (
                <div className={styles.exportDropdown}>
                  <button className={styles.exportDropdownItem} onClick={handleCSV}>
                    <FileSpreadsheet size={14} />
                    Exportar CSV
                  </button>
                  <button className={styles.exportDropdownItem} onClick={handlePDF}>
                    <FileText size={14} />
                    Exportar PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Campanha</th>
                <th>Plataforma</th>
                <th>Investido</th>
                <th>Impressões</th>
                <th>Cliques</th>
                <th>CTR</th>
                <th>Conversões</th>
                <th>CPA</th>
                <th>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.03 }}
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
                  <td>{c.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>{c.impressions.toLocaleString('pt-BR')}</td>
                  <td>{c.clicks.toLocaleString('pt-BR')}</td>
                  <td>{c.ctr.toFixed(2)}%</td>
                  <td>{c.conversions.toLocaleString('pt-BR')}</td>
                  <td>{c.cpa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <span className={
                      c.roas >= 6 ? styles.roasHigh :
                      c.roas >= 3.5 ? styles.roasMid :
                      styles.roasLow
                    }>
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
  );
}
