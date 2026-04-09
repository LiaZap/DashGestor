import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Image,
  Settings,
  Share2,
  Globe,
  Megaphone,
  Wallet,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'meta-ads', icon: Share2 },
  { id: 'google-ads', icon: Globe },
  { id: 'campanhas', icon: Megaphone },
  { id: 'anuncios', icon: Image },
  { id: 'orcamento', icon: Wallet },
  { id: 'relatorios', icon: Settings },
];

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <div className={styles.logoIcon}>G</div>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`${styles.navBtn} ${isActive ? styles.active : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              {isActive && (
                <motion.div
                  className={styles.activeBg}
                  layoutId="sidebarActive"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className={styles.icon} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
