import { useState, useMemo, useCallback, useEffect } from 'react';
import { generateDailyMetrics, getKPIs, campaigns as mockCampaigns } from '../data/mockData';
import type { Campaign, DailyMetric } from '../data/mockData';
import { fetchDashboardOverview } from '../services/api';

export type Period = '7d' | '14d' | '30d' | '90d' | 'custom';
export type Platform = 'all' | 'meta' | 'google';

export interface CustomDateRange {
  since: string; // YYYY-MM-DD
  until: string; // YYYY-MM-DD
}

const periodDays: Record<string, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
};

/** Transforms Meta insights API response into DailyMetric[] */
function parseMetaInsights(data: any): DailyMetric[] {
  if (!data?.data || !Array.isArray(data.data)) return [];
  return data.data.map((row: any) => {
    const spend = parseFloat(row.spend || '0');
    const impressions = parseInt(row.impressions || '0');
    const clicks = parseInt(row.clicks || '0');
    const ctr = parseFloat(row.ctr || '0');
    const actions = row.actions || [];
    const actionValues = row.action_values || [];

    const conversions = parseInt(
      actions.find((a: any) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || '0'
    );

    const revenue = parseFloat(
      actionValues.find((a: any) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value
      || actionValues.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value
      || '0'
    );

    return {
      date: row.date_start,
      investment: spend,
      revenue,
      impressions,
      clicks,
      conversions,
      cpa: conversions > 0 ? spend / conversions : 0,
      roas: spend > 0 ? revenue / spend : 0,
      ctr,
    };
  });
}

/** Transforms Meta campaigns API response into Campaign[] */
function parseMetaCampaigns(data: any): Campaign[] {
  if (!data?.data || !Array.isArray(data.data)) return [];
  return data.data.map((c: any) => {
    const insights = c.insights?.data?.[0] || {};
    const spend = parseFloat(insights.spend || '0');
    const impressions = parseInt(insights.impressions || '0');
    const clicks = parseInt(insights.clicks || '0');
    const ctr = parseFloat(insights.ctr || '0');
    const actions = insights.actions || [];
    const actionValues = insights.action_values || [];

    const conversions = parseInt(
      actions.find((a: any) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || '0'
    );

    const revenue = parseFloat(
      actionValues.find((a: any) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value
      || actionValues.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value
      || '0'
    );

    const budget = parseFloat(c.daily_budget || c.lifetime_budget || '0') / 100;

    return {
      id: c.id,
      name: c.name,
      platform: 'meta' as const,
      status: c.status === 'ACTIVE' ? 'active' as const : (c.status === 'PAUSED' || c.status === 'DISABLED') ? 'paused' as const : 'ended' as const,
      budget,
      spent: spend,
      impressions,
      clicks,
      conversions,
      revenue,
      ctr,
      cpa: conversions > 0 ? spend / conversions : 0,
      roas: spend > 0 ? revenue / spend : 0,
      objective: c.objective || 'Conversão',
    };
  });
}

/** Transforms Google campaigns API response (searchStream) into Campaign[] */
function parseGoogleCampaigns(data: any): Campaign[] {
  if (!data || data.error) return [];
  const results = Array.isArray(data) ? data.flatMap((batch: any) => batch.results || []) : [];
  return results.map((row: any) => {
    const spent = (row.metrics?.costMicros || 0) / 1_000_000;
    const impressions = parseInt(row.metrics?.impressions || '0');
    const clicks = parseInt(row.metrics?.clicks || '0');
    const conversions = parseFloat(row.metrics?.conversions || '0');
    const revenue = parseFloat(row.metrics?.conversionsValue || '0');
    const budget = (row.campaignBudget?.amountMicros || 0) / 1_000_000;

    return {
      id: String(row.campaign?.id || ''),
      name: row.campaign?.name || '',
      platform: 'google' as const,
      status: (row.campaign?.status || '').toLowerCase() === 'enabled' ? 'active' as const : 'paused' as const,
      budget,
      spent,
      impressions,
      clicks,
      conversions,
      revenue,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpa: conversions > 0 ? spent / conversions : 0,
      roas: spent > 0 ? revenue / spent : 0,
      objective: row.campaign?.advertisingChannelType || 'Conversão',
    };
  });
}

export function useDashboard() {
  const [period, setPeriod] = useState<Period>('7d');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | null>(null);
  const [platform, setPlatform] = useState<Platform>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedAdGroup, setSelectedAdGroup] = useState('all');
  const [selectedObjective, setSelectedObjective] = useState('all');

  const [apiDailyMetrics, setApiDailyMetrics] = useState<DailyMetric[] | null>(null);
  const [apiCampaigns, setApiCampaigns] = useState<Campaign[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always try API - backend has tokens in env vars even if localStorage is empty
  const fetchData = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {
      console.log('[GestorDash] Fetching from API...', { period, platform, customDateRange });
      const overview = await fetchDashboardOverview(
        period,
        platform,
        period === 'custom' && customDateRange ? customDateRange : undefined
      );
      console.log('[GestorDash] API response:', overview);

      // Parse daily metrics from Meta insights
      const metaDaily = overview.meta && !overview.meta.error
        ? parseMetaInsights(overview.meta)
        : [];

      // Parse campaigns
      const metaCamps = overview.metaCampaigns && !overview.metaCampaigns.error
        ? parseMetaCampaigns(overview.metaCampaigns)
        : [];

      const googleCamps = overview.googleCampaigns && !overview.googleCampaigns.error
        ? parseGoogleCampaigns(overview.googleCampaigns)
        : [];

      console.log('[GestorDash] Parsed:', { metaDaily: metaDaily.length, metaCamps: metaCamps.length, googleCamps: googleCamps.length });

      if (metaDaily.length > 0) {
        setApiDailyMetrics(metaDaily);
      }

      const allCampaigns = [...metaCamps, ...googleCamps];
      if (allCampaigns.length > 0) {
        setApiCampaigns(allCampaigns);
      }
    } catch (e) {
      console.error('[GestorDash] API error:', e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [period, platform, customDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use API data when available, fallback to mock
  const campaigns = apiCampaigns || mockCampaigns;
  const dailyMetrics = useMemo(() => {
    return apiDailyMetrics || generateDailyMetrics(periodDays[period] || 30);
  }, [apiDailyMetrics, period]);

  // Filter campaigns based on all active filters
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (platform !== 'all') {
      result = result.filter(c => c.platform === platform);
    }
    if (selectedCampaign !== 'all') {
      result = result.filter(c => c.id === selectedCampaign);
    }
    if (selectedObjective !== 'all') {
      result = result.filter(c => c.objective === selectedObjective);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [campaigns, platform, selectedCampaign, selectedObjective, searchQuery]);

  // Scale daily metrics based on how many campaigns are selected vs total
  const scaledDailyMetrics = useMemo(() => {
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const filteredSpent = filteredCampaigns.reduce((s, c) => s + c.spent, 0);
    const scale = totalSpent > 0 ? filteredSpent / totalSpent : 1;

    if (scale === 1) return dailyMetrics;

    return dailyMetrics.map(m => ({
      ...m,
      investment: Math.round(m.investment * scale),
      revenue: Math.round(m.revenue * scale),
      impressions: Math.round(m.impressions * scale),
      clicks: Math.round(m.clicks * scale),
      conversions: Math.round(m.conversions * scale),
      cpa: m.conversions > 0 ? Math.round((m.investment * scale) / Math.max(1, Math.round(m.conversions * scale)) * 100) / 100 : 0,
      roas: m.roas,
      ctr: m.ctr,
    }));
  }, [dailyMetrics, campaigns, filteredCampaigns]);

  const kpis = useMemo(() => getKPIs(scaledDailyMetrics), [scaledDailyMetrics]);

  const platformBreakdown = useMemo(() => {
    const filtered = filteredCampaigns.length > 0 ? filteredCampaigns : campaigns;
    const meta = filtered.filter(c => c.platform === 'meta');
    const google = filtered.filter(c => c.platform === 'google');
    const metaSpent = meta.reduce((s, c) => s + c.spent, 0);
    const googleSpent = google.reduce((s, c) => s + c.spent, 0);
    const total = metaSpent + googleSpent;
    if (total === 0) return [
      { name: 'Meta Ads', value: 0, spent: 0 },
      { name: 'Google Ads', value: 0, spent: 0 },
    ];
    return [
      { name: 'Meta Ads', value: Math.round((metaSpent / total) * 100), spent: metaSpent },
      { name: 'Google Ads', value: Math.round((googleSpent / total) * 100), spent: googleSpent },
    ];
  }, [filteredCampaigns, campaigns]);

  // Derive available filter options from campaigns
  const campaignOptions = useMemo(() => {
    let pool = campaigns;
    if (platform !== 'all') pool = pool.filter(c => c.platform === platform);
    if (selectedObjective !== 'all') pool = pool.filter(c => c.objective === selectedObjective);
    return pool.map(c => ({ value: c.id, label: c.name }));
  }, [campaigns, platform, selectedObjective]);

  const objectiveOptions = useMemo(() => {
    let pool = campaigns;
    if (platform !== 'all') pool = pool.filter(c => c.platform === platform);
    const objectives = [...new Set(pool.map(c => c.objective))];
    return objectives.map(o => ({ value: o, label: o }));
  }, [campaigns, platform]);

  const adGroupOptions = useMemo(() => {
    const pool = filteredCampaigns.length > 0 ? filteredCampaigns : campaigns;
    return pool.map(c => ({ value: c.id, label: `${c.name.split(' - ')[0]} - Grupo` }));
  }, [filteredCampaigns, campaigns]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    platform,
    setPlatform,
    searchQuery,
    setSearchQuery,
    selectedCampaign,
    setSelectedCampaign,
    selectedAdGroup,
    setSelectedAdGroup,
    selectedObjective,
    setSelectedObjective,
    dailyMetrics: scaledDailyMetrics,
    kpis,
    filteredCampaigns,
    platformBreakdown,
    campaignOptions,
    objectiveOptions,
    adGroupOptions,
    refresh,
    loading,
    error,
    isUsingRealData: apiDailyMetrics !== null || apiCampaigns !== null,
  };
}
