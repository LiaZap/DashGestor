import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, AlertTriangle, AlertCircle, CheckCircle,
} from 'lucide-react';
import styles from './NotificationsPanel.module.css';

interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'success';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialAlerts: Alert[] = [
  { id: '1', type: 'danger', title: 'ROAS abaixo do alvo', description: 'Display - Remarketing GDN com ROAS 2.45x (meta: 3.0x)', time: '5 min atrás', read: false },
  { id: '2', type: 'warning', title: 'CPA acima da média', description: 'Stories - Countdown com CPA R$22,10 (+35% vs média)', time: '15 min atrás', read: false },
  { id: '3', type: 'success', title: 'Meta de conversões atingida', description: 'Performance Max - Geral atingiu 234 conversões', time: '1h atrás', read: false },
  { id: '4', type: 'warning', title: 'Orçamento quase esgotado', description: 'Lookalike 1% - Compradores com 78% do orçamento utilizado', time: '2h atrás', read: true },
  { id: '5', type: 'success', title: 'ROAS recorde', description: 'PMax - Asset Group 1 alcançou ROAS 8.90x', time: '3h atrás', read: true },
  { id: '6', type: 'danger', title: 'CTR em queda', description: 'Display Banner 728x90 com CTR 0.61% (-40% na semana)', time: '4h atrás', read: true },
  { id: '7', type: 'warning', title: 'Campanha pausada automaticamente', description: 'Stories - Countdown pausada por baixa performance', time: '5h atrás', read: true },
];

const severityIcon = {
  danger: AlertTriangle,
  warning: AlertCircle,
  success: CheckCircle,
} as const;

const severityClass = {
  danger: styles.iconDanger,
  warning: styles.iconWarning,
  success: styles.iconSuccess,
} as const;

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  return (
    <>
      {/* Bell trigger */}
      <button
        className={styles.bellButton}
        onClick={() => setOpen(true)}
        aria-label="Notificações"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Panel + Backdrop */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className={styles.panel}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            >
              {/* Header */}
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Notificações</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Actions */}
              <div className={styles.panelActions}>
                <span className={styles.alertCount}>
                  {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                </span>
                <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
                  Marcar todas como lidas
                </button>
              </div>

              {/* Alert List */}
              <div className={styles.alertList}>
                {alerts.map((alert) => {
                  const Icon = severityIcon[alert.type];
                  return (
                    <div
                      key={alert.id}
                      className={`${styles.alertCard} ${!alert.read ? styles.alertUnread : ''}`}
                    >
                      <div className={`${styles.alertIconWrap} ${severityClass[alert.type]}`}>
                        <Icon size={16} />
                      </div>
                      <div className={styles.alertContent}>
                        <div className={styles.alertTitle}>{alert.title}</div>
                        <div className={styles.alertDesc}>{alert.description}</div>
                        <div className={styles.alertTime}>{alert.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
