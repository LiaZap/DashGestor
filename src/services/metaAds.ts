/**
 * Meta Marketing API Service
 *
 * Para conectar com a API do Meta Ads, você precisa:
 *
 * 1. Criar um App no Meta for Developers (https://developers.facebook.com)
 * 2. Adicionar o produto "Marketing API"
 * 3. Gerar um Access Token com as permissões:
 *    - ads_read
 *    - ads_management
 *    - read_insights
 * 4. Obter o Ad Account ID (formato: act_XXXXXXXXX)
 *
 * Para produção, use um System User Token (não expira)
 * ou implemente o fluxo OAuth para tokens de longa duração.
 */

const META_API_VERSION = 'v21.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaAdsConfig {
  accessToken: string;
  adAccountId: string; // formato: act_XXXXXXXXX
}

export interface MetaInsight {
  date_start: string;
  date_stop: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpm: string;
  cpc: string;
  reach: string;
  actions?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  video_p25_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p50_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p75_watched_actions?: Array<{ action_type: string; value: string }>;
  video_p100_watched_actions?: Array<{ action_type: string; value: string }>;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  insights?: { data: MetaInsight[] };
}

/**
 * Busca insights gerais da conta de anúncios
 */
export async function getAccountInsights(
  config: MetaAdsConfig,
  dateRange: { since: string; until: string },
  breakdown?: 'age' | 'gender' | 'region' | 'country'
): Promise<MetaInsight[]> {
  const fields = [
    'spend', 'impressions', 'clicks', 'ctr', 'cpm', 'cpc', 'reach',
    'actions', 'cost_per_action_type', 'action_values',
    'video_p25_watched_actions', 'video_p50_watched_actions',
    'video_p75_watched_actions', 'video_p100_watched_actions',
  ].join(',');

  const params = new URLSearchParams({
    access_token: config.accessToken,
    fields,
    time_range: JSON.stringify(dateRange),
    time_increment: '1', // Daily breakdown
  });

  if (breakdown) {
    params.set('breakdowns', breakdown);
  }

  const res = await fetch(
    `${META_API_BASE}/${config.adAccountId}/insights?${params}`
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Meta API Error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.data || [];
}

/**
 * Busca todas as campanhas com insights
 */
export async function getCampaigns(
  config: MetaAdsConfig,
  dateRange: { since: string; until: string }
): Promise<MetaCampaign[]> {
  const insightFields = [
    'spend', 'impressions', 'clicks', 'ctr', 'cpm', 'cpc', 'reach',
    'actions', 'cost_per_action_type', 'action_values',
  ].join(',');

  const params = new URLSearchParams({
    access_token: config.accessToken,
    fields: `name,status,objective,daily_budget,lifetime_budget,insights.time_range(${JSON.stringify(dateRange)}){${insightFields}}`,
    limit: '100',
  });

  const res = await fetch(
    `${META_API_BASE}/${config.adAccountId}/campaigns?${params}`
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Meta API Error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.data || [];
}

/**
 * Busca métricas do funil: link_click, landing_page_view,
 * add_to_cart, initiate_checkout, purchase
 */
export async function getFunnelMetrics(
  config: MetaAdsConfig,
  dateRange: { since: string; until: string }
) {
  const insights = await getAccountInsights(config, dateRange);

  if (!insights.length) return null;

  const insight = insights[0];
  const actions = insight.actions || [];
  const costs = insight.cost_per_action_type || [];
  const values = insight.action_values || [];

  const getAction = (type: string) =>
    parseInt(actions.find(a => a.action_type === type)?.value || '0');
  const getCost = (type: string) =>
    parseFloat(costs.find(a => a.action_type === type)?.value || '0');
  const getValue = (type: string) =>
    parseFloat(values.find(a => a.action_type === type)?.value || '0');

  return {
    impressions: parseInt(insight.impressions),
    reach: parseInt(insight.reach),
    linkClicks: getAction('link_click'),
    landingPageViews: getAction('landing_page_view'),
    addToCart: getAction('offsite_conversion.fb_pixel_add_to_cart'),
    initiateCheckout: getAction('offsite_conversion.fb_pixel_initiate_checkout'),
    purchases: getAction('offsite_conversion.fb_pixel_purchase'),
    spend: parseFloat(insight.spend),
    purchaseValue: getValue('offsite_conversion.fb_pixel_purchase'),
    costPerLinkClick: getCost('link_click'),
    costPerPurchase: getCost('offsite_conversion.fb_pixel_purchase'),
    // Video metrics
    videoP25: parseInt(insight.video_p25_watched_actions?.[0]?.value || '0'),
    videoP50: parseInt(insight.video_p50_watched_actions?.[0]?.value || '0'),
    videoP75: parseInt(insight.video_p75_watched_actions?.[0]?.value || '0'),
    videoP100: parseInt(insight.video_p100_watched_actions?.[0]?.value || '0'),
  };
}

/**
 * Busca dados demográficos (região)
 */
export async function getDemographics(
  config: MetaAdsConfig,
  dateRange: { since: string; until: string }
) {
  return getAccountInsights(config, dateRange, 'region');
}

/**
 * Helpers para extrair métricas normalizadas
 */
export function normalizeMetaInsight(insight: MetaInsight) {
  const actions = insight.actions || [];
  const values = insight.action_values || [];

  const getAction = (type: string) =>
    parseInt(actions.find(a => a.action_type === type)?.value || '0');
  const getValue = (type: string) =>
    parseFloat(values.find(a => a.action_type === type)?.value || '0');

  const spend = parseFloat(insight.spend);
  const conversions = getAction('offsite_conversion.fb_pixel_purchase')
    || getAction('lead')
    || getAction('complete_registration');
  const revenue = getValue('offsite_conversion.fb_pixel_purchase');

  return {
    date: insight.date_start,
    investment: spend,
    impressions: parseInt(insight.impressions),
    clicks: parseInt(insight.clicks),
    ctr: parseFloat(insight.ctr),
    cpm: parseFloat(insight.cpm),
    reach: parseInt(insight.reach),
    conversions,
    revenue,
    cpa: conversions > 0 ? spend / conversions : 0,
    roas: spend > 0 ? revenue / spend : 0,
  };
}
