import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { KPICard } from './components/cards/KPICard';
import { PerformanceChart } from './components/charts/PerformanceChart';
import { PlatformChart } from './components/charts/PlatformChart';
import { ConversionsChart } from './components/charts/ConversionsChart';
import { CpaRoasChart } from './components/charts/CpaRoasChart';
import { ObjectiveChart } from './components/charts/ObjectiveChart';
import { FunnelCard } from './components/cards/FunnelCard';
import { TopCampaigns } from './components/cards/TopCampaigns';
import { CampaignsTable } from './components/cards/CampaignsTable';
import { BudgetCard } from './components/cards/BudgetCard';
import { ApiSettings } from './components/cards/ApiSettings';
import { MetaAdsPage } from './components/pages/MetaAdsPage';
import { GoogleAdsPage } from './components/pages/GoogleAdsPage';
import { CampanhasPage } from './components/pages/CampanhasPage';
import { OrcamentoPage } from './components/pages/OrcamentoPage';
import { AnunciosPage } from './components/pages/AnunciosPage';
import { useDashboard } from './hooks/useDashboard';
import './styles/global.css';
import styles from './App.module.css';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const {
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
    dailyMetrics,
    kpis,
    filteredCampaigns,
    platformBreakdown,
    campaignOptions,
    objectiveOptions,
    adGroupOptions,
    refresh,
  } = useDashboard();

  const renderContent = () => {
    switch (activePage) {
      case 'meta-ads':
        return <MetaAdsPage campaigns={filteredCampaigns} dailyMetrics={dailyMetrics} />;
      case 'google-ads':
        return <GoogleAdsPage campaigns={filteredCampaigns} dailyMetrics={dailyMetrics} />;
      case 'campanhas':
        return <CampanhasPage campaigns={filteredCampaigns} />;
      case 'anuncios':
        return <AnunciosPage />;
      case 'orcamento':
        return <OrcamentoPage />;
      case 'relatorios':
        return <div className={styles.settingsPage}><ApiSettings /></div>;
      default:
        return (
          <>
            {/* Row 1: KPIs (3x2) + Funnel + Top Campaigns */}
            <section className={styles.mainGrid}>
              {/* Left: 6 KPI Cards in 3x2 */}
              <div className={styles.kpiSection}>
                <div className={styles.kpiGrid}>
                  {kpis.slice(0, 6).map((kpi, i) => (
                    <KPICard key={kpi.label} kpi={kpi} index={i} />
                  ))}
                </div>
                {/* Timeline chart below KPIs */}
                <PerformanceChart data={dailyMetrics} />
              </div>

              {/* Center: Funnel */}
              <div className={styles.funnelSection}>
                <FunnelCard />
              </div>

              {/* Right: Top Campaigns */}
              <div className={styles.rightSection}>
                <TopCampaigns campaigns={filteredCampaigns} />
              </div>
            </section>

            {/* Row 2: Charts + Demographics */}
            <section className={styles.chartsRowThree}>
              <ConversionsChart data={dailyMetrics} />
              <CpaRoasChart data={dailyMetrics} />
              <PlatformChart data={platformBreakdown} />
            </section>

            {/* Row 3: Campaigns Table */}
            <section>
              <CampaignsTable
                campaigns={filteredCampaigns}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </section>

            {/* Row 4: Budget + Objective */}
            <section className={styles.chartsRow}>
              <BudgetCard />
              <ObjectiveChart />
            </section>
          </>
        );
    }
  };

  return (
    <>
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={styles.main}>
        <TopBar
          activePage={activePage}
          onPageChange={setActivePage}
          period={period}
          onPeriodChange={setPeriod}
          platform={platform}
          onPlatformChange={setPlatform}
          selectedCampaign={selectedCampaign}
          onCampaignChange={setSelectedCampaign}
          selectedAdGroup={selectedAdGroup}
          onAdGroupChange={setSelectedAdGroup}
          selectedObjective={selectedObjective}
          onObjectiveChange={setSelectedObjective}
          campaignOptions={campaignOptions}
          adGroupOptions={adGroupOptions}
          objectiveOptions={objectiveOptions}
          onRefresh={refresh}
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>
    </>
  );
}
