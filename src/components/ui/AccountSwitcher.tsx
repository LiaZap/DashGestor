import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './AccountSwitcher.module.css';

interface Account {
  id: string;
  name: string;
  avatar: string;
  platform: string;
  spent: number;
  active: boolean;
}

const mockAccounts: Account[] = [
  { id: '1', name: 'Loja Principal', avatar: 'LP', platform: 'Meta + Google', spent: 18420, active: true },
  { id: '2', name: 'E-commerce BR', avatar: 'EB', platform: 'Meta Ads', spent: 8500, active: false },
  { id: '3', name: 'Marketplace SP', avatar: 'MS', platform: 'Google Ads', spent: 12300, active: false },
];

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

interface AccountSwitcherProps {
  trigger: (onClick: () => void) => ReactNode;
}

export function AccountSwitcher({ trigger }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => ({ ...acc, active: acc.id === id }))
    );
    setOpen(false);
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
            <div className={styles.dropdownLabel}>Contas</div>
            <div className={styles.accountList}>
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  className={`${styles.accountItem} ${acc.active ? styles.accountItemActive : ''}`}
                  onClick={() => handleSelect(acc.id)}
                >
                  <div className={`${styles.avatar} ${acc.active ? styles.avatarActive : styles.avatarInactive}`}>
                    {acc.avatar}
                  </div>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{acc.name}</div>
                    <div className={styles.accountPlatform}>{acc.platform}</div>
                  </div>
                  <div className={styles.accountSpent}>{formatCurrency(acc.spent)}</div>
                  {acc.active && <Check size={16} className={styles.checkIcon} />}
                </button>
              ))}
            </div>
            <div className={styles.divider} />
            <button type="button" className={styles.addBtn}>
              <Plus size={14} />
              Adicionar Conta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
