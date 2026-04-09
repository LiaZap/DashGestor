import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { isMetaConfigured, isGoogleConfigured, getMetaConfig } from '../../services/apiConfig';
import styles from './AccountSwitcher.module.css';

interface Account {
  id: string;
  name: string;
  avatar: string;
  platform: string;
  active: boolean;
}

function buildAccounts(): Account[] {
  const accounts: Account[] = [];
  const metaConfig = getMetaConfig();

  if (isMetaConfigured() && metaConfig) {
    accounts.push({
      id: 'meta',
      name: `Meta Ads`,
      avatar: 'MA',
      platform: `act_${metaConfig.adAccountId.replace('act_', '')}`,
      active: true,
    });
  }

  if (isGoogleConfigured()) {
    accounts.push({
      id: 'google',
      name: 'Google Ads',
      avatar: 'GA',
      platform: 'Conectado',
      active: true,
    });
  }

  if (accounts.length === 0) {
    accounts.push({
      id: 'none',
      name: 'Nenhuma conta',
      avatar: '?',
      platform: 'Configure nas Configurações',
      active: false,
    });
  }

  return accounts;
}

interface AccountSwitcherProps {
  trigger: (onClick: () => void) => ReactNode;
  onGoToSettings?: () => void;
}

export function AccountSwitcher({ trigger, onGoToSettings }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const accounts = buildAccounts();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {trigger(handleToggle)}

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className={styles.dropdownLabel}>Contas Conectadas</div>
            <div className={styles.accountList}>
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`${styles.accountItem} ${acc.active ? styles.accountItemActive : ''}`}
                >
                  <div className={`${styles.avatar} ${acc.active ? styles.avatarActive : styles.avatarInactive}`}>
                    {acc.avatar}
                  </div>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{acc.name}</div>
                    <div className={styles.accountPlatform}>{acc.platform}</div>
                  </div>
                  {acc.active && <Check size={16} className={styles.checkIcon} />}
                </div>
              ))}
            </div>
            <div className={styles.divider} />
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => { setOpen(false); onGoToSettings?.(); }}
            >
              <Settings size={14} />
              Configurações de API
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
