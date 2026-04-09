/**
 * Gerenciamento de configuração das APIs
 *
 * As chaves são salvas no localStorage para persistência.
 * Em produção, use variáveis de ambiente no backend ou
 * um serviço de gerenciamento de secrets.
 */

import type { MetaAdsConfig } from './metaAds';
import type { GoogleAdsConfig } from './googleAds';
import { env } from '../config/env';

// API and OAuth configuration from environment variables
export const API_BASE_URL = env.apiUrl;
export const META_APP_ID = env.metaAppId;
export const GOOGLE_CLIENT_ID = env.googleClientId;

const STORAGE_KEY_META = 'gestordash_meta_config';
const STORAGE_KEY_GOOGLE = 'gestordash_google_config';

export function getMetaConfig(): MetaAdsConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_META);
    if (!stored) return null;
    const config = JSON.parse(stored);
    if (!config.accessToken || !config.adAccountId) return null;
    return config;
  } catch {
    return null;
  }
}

export function saveMetaConfig(config: MetaAdsConfig): void {
  localStorage.setItem(STORAGE_KEY_META, JSON.stringify(config));
}

export function getGoogleConfig(): GoogleAdsConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_GOOGLE);
    if (!stored) return null;
    const config = JSON.parse(stored);
    if (!config.accessToken || !config.customerId) return null;
    return config;
  } catch {
    return null;
  }
}

export function saveGoogleConfig(config: GoogleAdsConfig): void {
  localStorage.setItem(STORAGE_KEY_GOOGLE, JSON.stringify(config));
}

export function clearAllConfigs(): void {
  localStorage.removeItem(STORAGE_KEY_META);
  localStorage.removeItem(STORAGE_KEY_GOOGLE);
}

export function isMetaConfigured(): boolean {
  return getMetaConfig() !== null;
}

export function isGoogleConfigured(): boolean {
  return getGoogleConfig() !== null;
}

/**
 * Calcula o date range baseado no período selecionado
 */
export function getDateRange(period: string): { from: string; to: string; since: string; until: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];

  const daysMap: Record<string, number> = {
    '7d': 7,
    '14d': 14,
    '30d': 30,
    '90d': 90,
  };

  const days = daysMap[period] || 7;
  const from = new Date(now);
  from.setDate(from.getDate() - days);

  const fromStr = from.toISOString().split('T')[0];

  return {
    from: fromStr,
    to,
    since: fromStr, // Meta uses since/until
    until: to,
  };
}
