export interface Campaign {
  id: string;
  name: string;
  platform: 'meta' | 'google';
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
  objective: string;
}

export interface DailyMetric {
  date: string;
  investment: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roas: number;
  ctr: number;
}

export interface KPI {
  label: string;
  value: string;
  rawValue: number;
  change: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  color: string;
}

export const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Remarketing - Carrinho Abandonado',
    platform: 'meta',
    status: 'active',
    budget: 3000,
    spent: 2340,
    impressions: 189432,
    clicks: 7234,
    conversions: 198,
    revenue: 19706,
    ctr: 3.82,
    cpa: 11.82,
    roas: 8.42,
    objective: 'Conversão',
  },
  {
    id: '2',
    name: 'Brand - Institucional',
    platform: 'google',
    status: 'active',
    budget: 2500,
    spent: 1890,
    impressions: 156789,
    clicks: 5432,
    conversions: 156,
    revenue: 13514,
    ctr: 3.46,
    cpa: 12.12,
    roas: 7.15,
    objective: 'Brand',
  },
  {
    id: '3',
    name: 'Lookalike 1% - Compradores',
    platform: 'meta',
    status: 'active',
    budget: 4000,
    spent: 3120,
    impressions: 312456,
    clicks: 8765,
    conversions: 215,
    revenue: 18377,
    ctr: 2.81,
    cpa: 14.51,
    roas: 5.89,
    objective: 'Conversão',
  },
  {
    id: '4',
    name: 'Search - Produto Principal',
    platform: 'google',
    status: 'active',
    budget: 3200,
    spent: 2560,
    impressions: 98234,
    clicks: 4567,
    conversions: 134,
    revenue: 13389,
    ctr: 4.65,
    cpa: 19.10,
    roas: 5.23,
    objective: 'Conversão',
  },
  {
    id: '5',
    name: 'Interesse - Público Frio',
    platform: 'meta',
    status: 'active',
    budget: 2000,
    spent: 1540,
    impressions: 289345,
    clicks: 5123,
    conversions: 89,
    revenue: 5652,
    ctr: 1.77,
    cpa: 17.30,
    roas: 3.67,
    objective: 'Tráfego',
  },
  {
    id: '6',
    name: 'Display - Remarketing GDN',
    platform: 'google',
    status: 'paused',
    budget: 1000,
    spent: 650,
    impressions: 145678,
    clicks: 1890,
    conversions: 32,
    revenue: 1593,
    ctr: 1.30,
    cpa: 20.31,
    roas: 2.45,
    objective: 'Remarketing',
  },
  {
    id: '7',
    name: 'Stories - Promoção Semanal',
    platform: 'meta',
    status: 'active',
    budget: 800,
    spent: 350,
    impressions: 53898,
    clicks: 1510,
    conversions: 23,
    revenue: 1092,
    ctr: 2.80,
    cpa: 15.22,
    roas: 3.12,
    objective: 'Engajamento',
  },
  {
    id: '8',
    name: 'Shopping - Catálogo Completo',
    platform: 'google',
    status: 'active',
    budget: 2800,
    spent: 2100,
    impressions: 234567,
    clicks: 6789,
    conversions: 178,
    revenue: 15246,
    ctr: 2.89,
    cpa: 11.80,
    roas: 7.26,
    objective: 'Conversão',
  },
  {
    id: '9',
    name: 'Reels - Criativo A/B Test',
    platform: 'meta',
    status: 'active',
    budget: 1500,
    spent: 980,
    impressions: 178234,
    clicks: 4321,
    conversions: 67,
    revenue: 4355,
    ctr: 2.42,
    cpa: 14.63,
    roas: 4.44,
    objective: 'Tráfego',
  },
  {
    id: '10',
    name: 'Performance Max - Geral',
    platform: 'google',
    status: 'active',
    budget: 3500,
    spent: 2890,
    impressions: 345678,
    clicks: 8901,
    conversions: 234,
    revenue: 21060,
    ctr: 2.58,
    cpa: 12.35,
    roas: 7.29,
    objective: 'Conversão',
  },
];

export function generateDailyMetrics(days: number): DailyMetric[] {
  const data: DailyMetric[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.75 : 1;
    const trendFactor = 1 + (days - i) * 0.008;
    const noise = 0.85 + Math.random() * 0.3;

    const investment = Math.round(1750 * weekendFactor * trendFactor * noise);
    const roas = 3.8 + Math.random() * 2.5;
    const revenue = Math.round(investment * roas);
    const impressions = Math.round(investment * 95 * noise);
    const ctr = 2.2 + Math.random() * 1.8;
    const clicks = Math.round(impressions * ctr / 100);
    const convRate = 2 + Math.random() * 2;
    const conversions = Math.round(clicks * convRate / 100);
    const cpa = conversions > 0 ? investment / conversions : 0;

    data.push({
      date: date.toISOString().split('T')[0],
      investment,
      revenue,
      impressions,
      clicks,
      conversions,
      cpa: Math.round(cpa * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
    });
  }

  return data;
}

export function getKPIs(metrics: DailyMetric[]): KPI[] {
  const totalInvestment = metrics.reduce((s, m) => s + m.investment, 0);
  const totalRevenue = metrics.reduce((s, m) => s + m.revenue, 0);
  const totalImpressions = metrics.reduce((s, m) => s + m.impressions, 0);
  const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
  const totalConversions = metrics.reduce((s, m) => s + m.conversions, 0);
  const avgCPA = totalConversions > 0 ? totalInvestment / totalConversions : 0;
  const avgROAS = totalInvestment > 0 ? totalRevenue / totalInvestment : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return [
    {
      label: 'Investimento',
      value: formatCurrency(totalInvestment),
      rawValue: totalInvestment,
      change: 12.5,
      icon: 'DollarSign',
      color: '#6366f1',
    },
    {
      label: 'Receita',
      value: formatCurrency(totalRevenue),
      rawValue: totalRevenue,
      change: 25.7,
      icon: 'TrendingUp',
      color: '#10b981',
    },
    {
      label: 'Impressões',
      value: formatCompact(totalImpressions),
      rawValue: totalImpressions,
      change: 8.3,
      icon: 'Eye',
      color: '#8b5cf6',
    },
    {
      label: 'Cliques',
      value: formatCompact(totalClicks),
      rawValue: totalClicks,
      change: 15.2,
      icon: 'MousePointer',
      color: '#06b6d4',
    },
    {
      label: 'Conversões',
      value: totalConversions.toLocaleString('pt-BR'),
      rawValue: totalConversions,
      change: 22.1,
      icon: 'ShoppingCart',
      color: '#14b8a6',
    },
    {
      label: 'CPA',
      value: formatCurrency(avgCPA),
      rawValue: avgCPA,
      change: -5.8,
      icon: 'Target',
      color: '#f59e0b',
    },
    {
      label: 'ROAS',
      value: `${avgROAS.toFixed(2).replace('.', ',')}x`,
      rawValue: avgROAS,
      change: 18.4,
      icon: 'BarChart3',
      color: '#ef4444',
    },
    {
      label: 'CTR',
      value: `${avgCTR.toFixed(2).replace('.', ',')}%`,
      rawValue: avgCTR,
      change: 3.1,
      icon: 'Percent',
      color: '#ec4899',
    },
  ];
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace('.', ',')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}K`;
  return value.toLocaleString('pt-BR');
}

export const budgetData = [
  { label: 'Meta Ads', spent: 8330, total: 11300, color: '#6366f1' },
  { label: 'Google Ads', spent: 10090, total: 13000, color: '#10b981' },
];

export const funnelData = [
  { label: 'Impressões', value: 1245832, color: '#6366f1', isPercent: false },
  { label: 'Alcance', value: 971749, color: '#06b6d4', isPercent: false },
  { label: 'Cliques', value: 34521, color: '#84cc16', isPercent: false },
  { label: 'CTR', value: 2.77, color: '#eab308', isPercent: true },
  { label: 'Conversões', value: 847, color: '#f59e0b', isPercent: false },
];

export const objectiveData = [
  { name: 'Conversão', value: 45, color: '#6366f1' },
  { name: 'Tráfego', value: 22, color: '#10b981' },
  { name: 'Remarketing', value: 18, color: '#8b5cf6' },
  { name: 'Brand', value: 10, color: '#06b6d4' },
  { name: 'Engajamento', value: 5, color: '#f59e0b' },
];
