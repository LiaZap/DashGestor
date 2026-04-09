import { useState, useMemo, useCallback } from 'react';
import { generateDailyMetrics, getKPIs, campaigns } from '../data/mockData';

export type Period = '7d' | '14d' | '30d' | '90d';
export type Platform = 'all' | 'meta' | 'google';

const periodDays: Record<Period, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
};

export function useDashboard() {
  const [period, setPeriod] = useState<Period>('7d');
  const [platform, setPlatform] = useState<Platform>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedAdGroup, setSelectedAdGroup] = useState('all');
  const [selectedObjective, setSelectedObjective] = useState('all');

  const dailyMetrics = useMemo(() => generateDailyMetrics(periodDays[period]), [period]);

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
  }, [platform, selectedCampaign, selectedObjective, searchQuery]);

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
  }, [dailyMetrics, filteredCampaigns]);

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
  }, [filteredCampaigns]);

  // Derive available filter options from campaigns
  const campaignOptions = useMemo(() => {
    let pool = campaigns;
    if (platform !== 'all') pool = pool.filter(c => c.platform === platform);
    if (selectedObjective !== 'all') pool = pool.filter(c => c.objective === selectedObjective);
    return pool.map(c => ({ value: c.id, label: c.name }));
  }, [platform, selectedObjective]);

  const objectiveOptions = useMemo(() => {
    let pool = campaigns;
    if (platform !== 'all') pool = pool.filter(c => c.platform === platform);
    const objectives = [...new Set(pool.map(c => c.objective))];
    return objectives.map(o => ({ value: o, label: o }));
  }, [platform]);

  const adGroupOptions = useMemo(() => {
    // Simulated ad groups derived from campaigns
    let pool = filteredCampaigns.length > 0 ? filteredCampaigns : campaigns;
    return pool.map(c => ({ value: c.id, label: `${c.name.split(' - ')[0]} - Grupo` }));
  }, [filteredCampaigns]);

  const refresh = useCallback(() => {
    // In production, this would refetch from APIs
  }, []);

  return {
    period,
    setPeriod,
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
  };
}
