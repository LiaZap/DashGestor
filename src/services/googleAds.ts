/**
 * Google Ads API Service
 *
 * Para conectar com a API do Google Ads, você precisa:
 *
 * 1. Criar um projeto no Google Cloud Console (https://console.cloud.google.com)
 * 2. Ativar a Google Ads API
 * 3. Criar credenciais OAuth 2.0 (Client ID + Client Secret)
 * 4. Solicitar um Developer Token no Google Ads Manager
 * 5. Obter:
 *    - Developer Token
 *    - OAuth2 Access Token (via fluxo de autenticação)
 *    - Refresh Token (para renovar automaticamente)
 *    - Customer ID (formato: XXX-XXX-XXXX, sem hífens na API)
 *
 * A API usa GAQL (Google Ads Query Language) para queries.
 *
 * IMPORTANTE: Em produção, o fluxo OAuth deve ser feito via backend
 * para proteger o Client Secret. O frontend deve chamar seu backend
 * que faz proxy das requisições para a API do Google Ads.
 */

const GOOGLE_ADS_API_VERSION = 'v18';
const GOOGLE_ADS_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

export interface GoogleAdsConfig {
  accessToken: string;
  developerToken: string;
  customerId: string; // formato: XXXXXXXXXX (sem hífens)
  managerCustomerId?: string; // se usando MCC
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface GoogleAdsKeyword {
  keyword: string;
  matchType: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  qualityScore: number;
}

/**
 * Executa uma query GAQL na API do Google Ads
 */
async function executeGaql(
  config: GoogleAdsConfig,
  query: string
): Promise<any[]> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.accessToken}`,
    'developer-token': config.developerToken,
    'Content-Type': 'application/json',
  };

  if (config.managerCustomerId) {
    headers['login-customer-id'] = config.managerCustomerId;
  }

  const res = await fetch(
    `${GOOGLE_ADS_BASE}/customers/${config.customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      `Google Ads API Error: ${error.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  // searchStream returns array of batches
  return data.flatMap((batch: any) => batch.results || []);
}

/**
 * Busca métricas gerais da conta por período
 */
export async function getAccountMetrics(
  config: GoogleAdsConfig,
  dateRange: { from: string; to: string } // formato: YYYY-MM-DD
) {
  const query = `
    SELECT
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_per_conversion
    FROM customer
    WHERE segments.date BETWEEN '${dateRange.from}' AND '${dateRange.to}'
    ORDER BY segments.date
  `;

  const results = await executeGaql(config, query);

  return results.map((row: any) => ({
    date: row.segments.date,
    investment: (row.metrics.costMicros || 0) / 1_000_000,
    impressions: parseInt(row.metrics.impressions || '0'),
    clicks: parseInt(row.metrics.clicks || '0'),
    ctr: parseFloat(row.metrics.ctr || '0') * 100,
    cpc: (row.metrics.averageCpc || 0) / 1_000_000,
    conversions: parseFloat(row.metrics.conversions || '0'),
    revenue: parseFloat(row.metrics.conversionsValue || '0'),
    cpa: (row.metrics.costPerConversion || 0) / 1_000_000,
    roas: parseFloat(row.metrics.conversionsValue || '0') /
      Math.max((row.metrics.costMicros || 0) / 1_000_000, 0.01),
  }));
}

/**
 * Busca campanhas com métricas
 */
export async function getCampaigns(
  config: GoogleAdsConfig,
  dateRange: { from: string; to: string }
): Promise<GoogleAdsCampaign[]> {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date BETWEEN '${dateRange.from}' AND '${dateRange.to}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `;

  const results = await executeGaql(config, query);

  return results.map((row: any) => {
    const spent = (row.metrics.costMicros || 0) / 1_000_000;
    const conversions = parseFloat(row.metrics.conversions || '0');
    const revenue = parseFloat(row.metrics.conversionsValue || '0');

    return {
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status.toLowerCase(),
      type: row.campaign.advertisingChannelType,
      budget: (row.campaignBudget?.amountMicros || 0) / 1_000_000,
      spent,
      impressions: parseInt(row.metrics.impressions || '0'),
      clicks: parseInt(row.metrics.clicks || '0'),
      conversions,
      conversionValue: revenue,
      ctr: parseFloat(row.metrics.ctr || '0') * 100,
      cpc: (row.metrics.averageCpc || 0) / 1_000_000,
      cpa: conversions > 0 ? spent / conversions : 0,
      roas: spent > 0 ? revenue / spent : 0,
    };
  });
}

/**
 * Busca performance de palavras-chave
 */
export async function getKeywordPerformance(
  config: GoogleAdsConfig,
  dateRange: { from: string; to: string }
): Promise<GoogleAdsKeyword[]> {
  const query = `
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.quality_info.quality_score,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions
    FROM keyword_view
    WHERE segments.date BETWEEN '${dateRange.from}' AND '${dateRange.to}'
      AND metrics.impressions > 0
    ORDER BY metrics.impressions DESC
    LIMIT 50
  `;

  const results = await executeGaql(config, query);

  return results.map((row: any) => ({
    keyword: row.adGroupCriterion.keyword.text,
    matchType: row.adGroupCriterion.keyword.matchType,
    impressions: parseInt(row.metrics.impressions || '0'),
    clicks: parseInt(row.metrics.clicks || '0'),
    conversions: parseFloat(row.metrics.conversions || '0'),
    cost: (row.metrics.costMicros || 0) / 1_000_000,
    ctr: parseFloat(row.metrics.ctr || '0') * 100,
    cpc: (row.metrics.averageCpc || 0) / 1_000_000,
    qualityScore: row.adGroupCriterion.qualityInfo?.qualityScore || 0,
  }));
}

/**
 * Busca métricas por grupo de anúncios
 */
export async function getAdGroupPerformance(
  config: GoogleAdsConfig,
  dateRange: { from: string; to: string }
) {
  const query = `
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      campaign.name,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM ad_group
    WHERE segments.date BETWEEN '${dateRange.from}' AND '${dateRange.to}'
      AND ad_group.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `;

  const results = await executeGaql(config, query);

  return results.map((row: any) => ({
    id: row.adGroup.id,
    name: row.adGroup.name,
    status: row.adGroup.status.toLowerCase(),
    campaignName: row.campaign.name,
    spent: (row.metrics.costMicros || 0) / 1_000_000,
    impressions: parseInt(row.metrics.impressions || '0'),
    clicks: parseInt(row.metrics.clicks || '0'),
    conversions: parseFloat(row.metrics.conversions || '0'),
    revenue: parseFloat(row.metrics.conversionsValue || '0'),
  }));
}
