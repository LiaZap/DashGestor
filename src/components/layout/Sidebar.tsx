import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Image,
  Settings,
  Megaphone,
  Wallet,
  LogOut,
} from 'lucide-react';
import { MetaLogo } from '../icons/MetaLogo';
import { GoogleAdsLogo } from '../icons/GoogleAdsLogo';
import { AppLogo } from '../icons/AppLogo';
import styles from './Sidebar.module.css';

const MetaIcon = ({ size = 18 }: { size?: number }) => <MetaLogo size={size} color="currentColor" />;
const GoogleIcon = ({ size = 18 }: { size?: number }) => <GoogleAdsLogo size={size} />;

const navItems = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'meta-ads', icon: MetaIcon },
  { id: 'google-ads', icon: GoogleIcon },
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
  userName?: string;
  onLogout?: () => void;
}

export function Sidebar({ activePage, onPageChange, userName, onLogout }: SidebarProps) {
  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <div className={styles.logoIcon}><AppLogo size={22} /></div>
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

      {/* Bottom: User avatar + Logout */}
      <div className={styles.bottomSection}>
        <div className={styles.userAvatar} title={userName || 'Usuário'}>
          {initials}
        </div>
        {onLogout && (
          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
