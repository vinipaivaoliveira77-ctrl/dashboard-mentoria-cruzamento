import React from 'react';
import type { WindsorMetrics } from '../lib/windsorService';
import {
  calculateConnectRate,
  calculatePageConversionRate,
  calculateCPL,
  calculateCPM,
  calculateCPC,
  calculateCTR,
} from '../lib/windsorService';
import { MetricCard } from './MetricCard';

interface MetricasMetaAdsProps {
  data: WindsorMetrics[];
  loading: boolean;
}

export const MetricasMetaAds: React.FC<MetricasMetaAdsProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return <div className="loading">Carregando dados do Meta Ads...</div>;
  }

  if (data.length === 0) {
    return null;
  }

  // Calculos agregados
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalLinkClicks = data.reduce((sum, item) => sum + item.link_clicks, 0);
  const totalLandingPageViews = data.reduce(
    (sum, item) => sum + item.landing_page_views,
    0
  );
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);

  const cpm = calculateCPM(totalSpend, totalImpressions);
  const cpc = calculateCPC(totalSpend, totalClicks);
  const ctr = calculateCTR(totalClicks, totalImpressions);

  const connectRate = calculateConnectRate(totalLandingPageViews, totalLinkClicks);
  const pageConversionRate = calculatePageConversionRate(totalLeads, totalLandingPageViews);
  const cpl = calculateCPL(totalSpend, totalLeads);

  return (
    <section className="metricas-meta">
      <h2>Meta Ads - Dados do Periodo</h2>

      <div className="metrics-grid">
        <MetricCard
          label="Impressoes"
          value={totalImpressions.toLocaleString('pt-BR')}
          icon="👁"
          color="blue"
        />
        <MetricCard
          label="Cliques"
          value={totalClicks.toLocaleString('pt-BR')}
          icon="→"
          color="orange"
        />
        <MetricCard
          label="Link Clicks"
          value={totalLinkClicks.toLocaleString('pt-BR')}
          icon="🔗"
          color="blue"
        />
        <MetricCard
          label="Landing Page Views"
          value={totalLandingPageViews.toLocaleString('pt-BR')}
          icon="📄"
          color="green"
        />
        <MetricCard
          label="Leads"
          value={totalLeads.toLocaleString('pt-BR')}
          icon="🎯"
          color="purple"
        />
        <MetricCard
          label="Gasto Total"
          value={`R$ ${totalSpend.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon="💳"
          color="orange"
        />
        <MetricCard
          label="CPM Medio"
          value={`R$ ${cpm.toFixed(2)}`}
          icon="💰"
          color="blue"
        />
        <MetricCard
          label="CPC Medio"
          value={`R$ ${cpc.toFixed(2)}`}
          icon="💵"
          color="green"
        />
        <MetricCard
          label="CTR Medio"
          value={`${ctr.toFixed(2)}%`}
          icon="📈"
          color="purple"
        />
        <MetricCard
          label="Connect Rate"
          value={`${connectRate.toFixed(2)}%`}
          icon="🔗"
          color="orange"
        />
        <MetricCard
          label="Taxa Conversao Pagina"
          value={`${pageConversionRate.toFixed(2)}%`}
          icon="✓"
          color="green"
        />
        <MetricCard
          label="CPL"
          value={`R$ ${cpl.toFixed(2)}`}
          icon="🎁"
          color="purple"
        />
      </div>

      {/* Tabela de Campanhas */}
      <div className="table-responsive">
        <h3>Desempenho por Campanha</h3>
        <table>
          <thead>
            <tr>
              <th>Campanha</th>
              <th>Conjunto de Anuncios</th>
              <th>Anuncio</th>
              <th>Impressoes</th>
              <th>Link Clicks</th>
              <th>Landing Page Views</th>
              <th>Leads</th>
              <th>Gasto</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>CTR</th>
              <th>Connect Rate</th>
              <th>Taxa Conversao</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const itemCpm = calculateCPM(item.spend, item.impressions);
              const itemCpc = calculateCPC(item.spend, item.clicks);
              const itemCtr = calculateCTR(item.clicks, item.impressions);
              const itemConnectRate = calculateConnectRate(
                item.landing_page_views,
                item.link_clicks
              );
              const itemPageConversionRate = calculatePageConversionRate(
                item.leads,
                item.landing_page_views
              );

              return (
                <tr key={idx}>
                  <td>{item.campaign_name}</td>
                  <td>{item.adset_name}</td>
                  <td>{item.ad_name}</td>
                  <td>{item.impressions.toLocaleString('pt-BR')}</td>
                  <td>{item.link_clicks.toLocaleString('pt-BR')}</td>
                  <td>{item.landing_page_views.toLocaleString('pt-BR')}</td>
                  <td>{item.leads.toLocaleString('pt-BR')}</td>
                  <td>R$ {item.spend.toFixed(2)}</td>
                  <td>R$ {itemCpm.toFixed(2)}</td>
                  <td>R$ {itemCpc.toFixed(2)}</td>
                  <td>{itemCtr.toFixed(2)}%</td>
                  <td>{itemConnectRate.toFixed(2)}%</td>
                  <td>{itemPageConversionRate.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
