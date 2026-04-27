import { env } from '../config/env';
import { getMetaConfig, getGoogleConfig } from './apiConfig';

const API_URL = env.apiUrl;
const AUTH_TOKEN_KEY = 'gestordash_auth_token';

function getToken(): string {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) throw new Error('Não autenticado');
  return token;
}

function buildHeaders(authToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  const meta = getMetaConfig();
  if (meta) {
    headers['x-meta-token'] = meta.accessToken;
    headers['x-meta-account-id'] = meta.adAccountId;
  }

  const google = getGoogleConfig();
  if (google) {
    headers['x-google-token'] = google.accessToken;
    if (google.developerToken) headers['x-google-dev-token'] = google.developerToken;
    headers['x-google-customer-id'] = google.customerId;
  }

  return headers;
}

export async function apiFetch<T = any>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const authToken = getToken();
  const headers = buildHeaders(authToken);

  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), { headers });

  if (res.status === 401) {
    // Token expired — clear and force re-login
    localStorage.removeItem(AUTH_TOKEN_KEY);
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API Error: ${res.status}`);
  }

  return res.json();
}

export async function fetchDashboardOverview(
  period: string,
  platform: string,
  dateRange?: { since: string; until: string }
) {
  const params: Record<string, string> = { period, platform };
  if (dateRange) {
    params.since = dateRange.since;
    params.until = dateRange.until;
  }
  return apiFetch('/dashboard/overview', params);
}

export async function fetchMetaInsights(period: string) {
  return apiFetch('/meta/insights', { period });
}

export async function fetchMetaCampaigns(period: string) {
  return apiFetch('/meta/campaigns', { period });
}

export async function fetchGoogleMetrics(period: string) {
  return apiFetch('/google/metrics', { period });
}

export async function fetchGoogleCampaigns(period: string) {
  return apiFetch('/google/campaigns', { period });
}
