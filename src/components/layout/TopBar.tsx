import { motion } from 'framer-motion';
import {
  Calendar, Layers, Grid3X3, Target, ChevronDown,
  LayoutDashboard, BarChart3,
} from 'lucide-react';
import { MetaLogo } from '../icons/MetaLogo';
import { GoogleAdsLogo } from '../icons/GoogleAdsLogo';
import { AppLogo } from '../icons/AppLogo';
import type { Period, Platform, CustomDateRange } from '../../hooks/useDashboard';
import { AccountSwitcher } from '../ui/AccountSwitcher';
import { NotificationsPanel } from '../ui/NotificationsPanel';
import styles from './TopBar.module.css';

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '14d', label: '14D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];

interface FilterOption {
  value: string;
  label: string;
}

const MetaIcon = ({ size = 20 }: { size?: number }) => <MetaLogo size={size} color="currentColor" />;
const GoogleIcon = ({ size = 20 }: { size?: number }) => <GoogleAdsLogo size={size} />;

const mobileNavItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'meta-ads', icon: MetaIcon, label: 'Meta' },
  { id: 'google-ads', icon: GoogleIcon, label: 'Google' },
  { id: 'campanhas', icon: BarChart3, label: 'Campanhas' },
  { id: 'orcamento', icon: Target, label: 'Orçamento' },
];

interface TopBarProps {
  activePage: string;
  onPageChange?: (page: string) => void;
  period: Period;
  onPeriodChange: (p: Period) => void;
  customDateRange: CustomDateRange | null;
  onCustomDateRangeChange: (range: CustomDateRange) => void;
  platform: Platform;
  onPlatformChange: (p: Platform) => void;
  selectedCampaign: string;
  onCampaignChange: (id: string) => void;
  selectedAdGroup: string;
  onAdGroupChange: (id: string) => void;
  selectedObjective: string;
  onObjectiveChange: (obj: string) => void;
  campaignOptions: FilterOption[];
  adGroupOptions: FilterOption[];
  objectiveOptions: FilterOption[];
  onRefresh: () => void;
  onMenuToggle: () => void;
  userName?: string;
}

export function TopBar({
  activePage,
  onPageChange,
  period,
  onPeriodChange,
  customDateRange,
  onCustomDateRangeChange,
  platform,
  onPlatformChange,
  selectedCampaign,
  onCampaignChange,
  selectedAdGroup,
  onAdGroupChange,
  selectedObjective,
  onObjectiveChange,
  campaignOptions,
  adGroupOptions,
  objectiveOptions,
  userName,
}: TopBarProps) {
  const userInitial = userName ? userName[0].toUpperCase() : 'A';
  return (
    <div className={styles.topBarWrapper}>
      {/* Header Pill */}
      <header className={styles.headerPill}>
        <div className={styles.headerLeft}>
          <div className={styles.headerLogo}><AppLogo size={18} /></div>
          <span className={styles.headerTitle}>
            Dashboard <span className={styles.headerSep}>|</span> Geral
          </span>
        </div>
        <div className={styles.headerRight}>
          <NotificationsPanel />
          <AccountSwitcher
            trigger={(onClick) => (
              <button className={styles.accountBtn} onClick={onClick} type="button">
                <div className={styles.accountAvatar}>{userInitial}</div>
                <span>{userName || 'Conta'}</span>
                <ChevronDown size={14} />
              </button>
            )}
          />
        </div>
      </header>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <Calendar size={14} className={styles.filterIcon} />
          <div className={styles.periodFilter}>
            {periods.map((p) => (
              <button
                key={p.value}
                className={`${styles.periodBtn} ${period === p.value ? styles.periodActive : ''}`}
                onClick={() => onPeriodChange(p.value)}
              >
                {period === p.value && (
                  <motion.div
                    className={styles.periodBg}
                    layoutId="periodActive"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{p.label}</span>
              </button>
            ))}
            <button
              className={`${styles.periodBtn} ${period === 'custom' ? styles.periodActive : ''}`}
              onClick={() => onPeriodChange('custom')}
            >
              {period === 'custom' && (
                <motion.div
                  className={styles.periodBg}
                  layoutId="periodActive"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>Custom</span>
            </button>
          </div>
          {period === 'custom' && (
            <div className={styles.dateRange}>
              <input
                type="date"
                className={styles.dateInput}
                value={customDateRange?.since || ''}
                onChange={(e) => onCustomDateRangeChange({
                  since: e.target.value,
                  until: customDateRange?.until || e.target.value,
                })}
              />
              <span className={styles.dateSep}>-</span>
              <input
                type="date"
                className={styles.dateInput}
                value={customDateRange?.until || ''}
                onChange={(e) => onCustomDateRangeChange({
                  since: customDateRange?.since || e.target.value,
                  until: e.target.value,
                })}
              />
            </div>
          )}
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <Layers size={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={selectedCampaign}
            onChange={(e) => onCampaignChange(e.target.value)}
          >
            <option value="all">Campanha</option>
            {campaignOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className={styles.filterChevron} />
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <Grid3X3 size={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={selectedAdGroup}
            onChange={(e) => onAdGroupChange(e.target.value)}
          >
            <option value="all">Grupo de Anúncios</option>
            {adGroupOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className={styles.filterChevron} />
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <Layers size={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={platform}
            onChange={(e) => onPlatformChange(e.target.value as Platform)}
          >
            <option value="all">Plataforma</option>
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
          </select>
          <ChevronDown size={12} className={styles.filterChevron} />
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <Target size={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={selectedObjective}
            onChange={(e) => onObjectiveChange(e.target.value)}
          >
            <option value="all">Objetivo</option>
            {objectiveOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className={styles.filterChevron} />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className={styles.mobileNav}>
        {mobileNavItems.map(item => (
          <button
            key={item.id}
            className={`${styles.mobileNavBtn} ${activePage === item.id ? styles.mobileNavActive : ''}`}
            onClick={() => onPageChange?.(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
