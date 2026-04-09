import { useState } from 'react';
import { Check, AlertCircle, Key, Globe, Share2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import {
  getMetaConfig, saveMetaConfig,
  getGoogleConfig, saveGoogleConfig,
  isMetaConfigured, isGoogleConfigured,
} from '../../services/apiConfig';
import styles from './ApiSettings.module.css';

export function ApiSettings() {
  const [metaToken, setMetaToken] = useState(getMetaConfig()?.accessToken || '');
  const [metaAccountId, setMetaAccountId] = useState(getMetaConfig()?.adAccountId || '');
  const [googleToken, setGoogleToken] = useState(getGoogleConfig()?.accessToken || '');
  const [googleDevToken, setGoogleDevToken] = useState(getGoogleConfig()?.developerToken || '');
  const [googleCustomerId, setGoogleCustomerId] = useState(getGoogleConfig()?.customerId || '');
  const [saved, setSaved] = useState('');

  function handleSaveMeta() {
    saveMetaConfig({ accessToken: metaToken, adAccountId: metaAccountId });
    setSaved('meta');
    setTimeout(() => setSaved(''), 2000);
  }

  function handleSaveGoogle() {
    saveGoogleConfig({
      accessToken: googleToken,
      developerToken: googleDevToken,
      customerId: googleCustomerId,
    });
    setSaved('google');
    setTimeout(() => setSaved(''), 2000);
  }

  return (
    <div className={styles.container}>
      {/* Meta Ads Config */}
      <GlassCard delay={0.1} glow>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.platformIcon} style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700' }}>
              <Share2 size={18} />
            </div>
            <div>
              <h3 className={styles.title}>Meta Ads API</h3>
              <p className={styles.subtitle}>Facebook & Instagram Ads</p>
            </div>
          </div>
          <div className={`${styles.statusBadge} ${isMetaConfigured() ? styles.connected : styles.disconnected}`}>
            {isMetaConfigured() ? <><Check size={12} /> Conectado</> : <><AlertCircle size={12} /> Desconectado</>}
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>
              <Key size={12} /> Access Token
            </label>
            <input
              type="password"
              value={metaToken}
              onChange={(e) => setMetaToken(e.target.value)}
              placeholder="Cole seu Access Token do Meta"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              <Globe size={12} /> Ad Account ID
            </label>
            <input
              type="text"
              value={metaAccountId}
              onChange={(e) => setMetaAccountId(e.target.value)}
              placeholder="act_XXXXXXXXX"
              className={styles.input}
            />
          </div>
          <button onClick={handleSaveMeta} className={styles.saveBtn}>
            {saved === 'meta' ? <><Check size={14} /> Salvo!</> : 'Salvar Configuração'}
          </button>
        </div>

        <div className={styles.helpText}>
          <p>1. Acesse <strong>developers.facebook.com</strong></p>
          <p>2. Crie um App e adicione &quot;Marketing API&quot;</p>
          <p>3. Gere um token com permissões: <code>ads_read</code>, <code>read_insights</code></p>
        </div>
      </GlassCard>

      {/* Google Ads Config */}
      <GlassCard delay={0.2} glow>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.platformIcon} style={{ background: 'rgba(0, 210, 106, 0.1)', color: '#00d26a' }}>
              <Globe size={18} />
            </div>
            <div>
              <h3 className={styles.title}>Google Ads API</h3>
              <p className={styles.subtitle}>Search, Display, Shopping, PMax</p>
            </div>
          </div>
          <div className={`${styles.statusBadge} ${isGoogleConfigured() ? styles.connected : styles.disconnected}`}>
            {isGoogleConfigured() ? <><Check size={12} /> Conectado</> : <><AlertCircle size={12} /> Desconectado</>}
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>
              <Key size={12} /> Access Token (OAuth2)
            </label>
            <input
              type="password"
              value={googleToken}
              onChange={(e) => setGoogleToken(e.target.value)}
              placeholder="Cole seu OAuth2 Access Token"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              <Key size={12} /> Developer Token
            </label>
            <input
              type="password"
              value={googleDevToken}
              onChange={(e) => setGoogleDevToken(e.target.value)}
              placeholder="Cole seu Developer Token"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              <Globe size={12} /> Customer ID
            </label>
            <input
              type="text"
              value={googleCustomerId}
              onChange={(e) => setGoogleCustomerId(e.target.value)}
              placeholder="XXXXXXXXXX (sem hífens)"
              className={styles.input}
            />
          </div>
          <button onClick={handleSaveGoogle} className={styles.saveBtn}>
            {saved === 'google' ? <><Check size={14} /> Salvo!</> : 'Salvar Configuração'}
          </button>
        </div>

        <div className={styles.helpText}>
          <p>1. Acesse <strong>console.cloud.google.com</strong></p>
          <p>2. Ative a Google Ads API e crie credenciais OAuth 2.0</p>
          <p>3. Solicite o Developer Token no Google Ads Manager</p>
        </div>
      </GlassCard>
    </div>
  );
}
