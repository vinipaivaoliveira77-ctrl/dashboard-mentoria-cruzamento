import React from 'react';
import type { WindsorMetrics } from '../lib/windsorService';
import {
  calculateConnectRate,
  calculatePageConversionRate,
  calculateCPL,
  calculateCPM,
  calculateCPC,
  calculateCTR,
  calculateCPS,
} from '../lib/windsorService';
import { MetricCard } from './MetricCard';
import {
  ImpressionIcon,
  LinkClickIcon,
  LandingPageIcon,
  CPMIcon,
  CPCIcon,
  CTRIcon,
  ConnectRateIcon,
  ConversionIcon,
} from './icons/TrafficIcons';

interface MetricasMetaAdsProps {
  data: WindsorMetrics[];
  instagramData?: WindsorMetrics[];
  loading: boolean;
}

export const MetricasMetaAds: React.FC<MetricasMetaAdsProps> = ({
  data,
  instagramData = [],
  loading,
}) => {
  if (loading) {
    return (
      <section className="metricas-meta">
        <h2>Meta Ads - Dados do Periodo</h2>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando dados do Meta Ads...</p>
          <p className="loading-hint">Períodos maiores podem levar até 30 segundos</p>
        </div>
      </section>
    );
  }

  if (data.length === 0) {
    return null;
  }

  // Calculos agregados
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalLinkClicks = data.reduce((sum, item) => sum + item.link_clicks, 0);
  const totalLandingPageViews = data.reduce(
    (sum, item) => sum + item.landing_page_views,
    0
  );
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);

  const cpm = calculateCPM(totalSpend, totalImpressions);
  const cpc = calculateCPC(totalSpend, totalLinkClicks);
  const ctr = calculateCTR(totalLinkClicks, totalImpressions);

  const connectRate = calculateConnectRate(totalLandingPageViews, totalLinkClicks);
  const pageConversionRate = calculatePageConversionRate(totalLeads, totalLandingPageViews);
  const cpl = calculateCPL(totalSpend, totalLeads);

  // Agrupar dados por nome do anúncio
  const groupedByAd = Object.values(
    data.reduce((acc, item) => {
      const key = item.ad_name;
      if (!acc[key]) {
        acc[key] = {
          ad_name: key,
          impressions: 0,
          link_clicks: 0,
          landing_page_views: 0,
          leads: 0,
          spend: 0,
        };
      }
      acc[key].impressions += item.impressions;
      acc[key].link_clicks += item.link_clicks;
      acc[key].landing_page_views += item.landing_page_views;
      acc[key].leads += item.leads;
      acc[key].spend += item.spend;
      return acc;
    }, {} as Record<string, { ad_name: string; impressions: number; link_clicks: number; landing_page_views: number; leads: number; spend: number }>)
  ).sort((a, b) => b.spend - a.spend);

  return (
    <>
      <section className="metricas-meta">
        <h2>Meta Ads - Dados do Periodo</h2>

      {/* Funil: Gasto → Leads → CPL */}
      <div className="funnel-container">
        <div className="funnel-item">
          <MetricCard
            label="Gasto Total"
            value={`R$ ${totalSpend.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon="💳"
            color="orange"
          />
        </div>
        <div className="funnel-arrow">→</div>
        <div className="funnel-item">
          <MetricCard
            label="Leads"
            value={totalLeads.toLocaleString('pt-BR')}
            icon="🎯"
            color="purple"
          />
        </div>
        <div className="funnel-arrow">→</div>
        <div className="funnel-item">
          <MetricCard
            label="CPL"
            value={`R$ ${cpl.toFixed(2)}`}
            icon="🎁"
            color="green"
          />
        </div>
      </div>

      {/* Métricas de tráfego em formato funil */}
      <div className="traffic-funnel">
        {/* Coluna esquerda: métricas base do funil */}
        <div className="traffic-funnel-col">
          <div className="funnel-step funnel-step-0">
            <MetricCard
              label="Impressoes"
              value={totalImpressions.toLocaleString('pt-BR')}
              icon={<ImpressionIcon />}
              color="blue"
            />
          </div>
          <div className="funnel-step-arrow">↓</div>
          <div className="funnel-step funnel-step-1">
            <MetricCard
              label="Link Clicks"
              value={totalLinkClicks.toLocaleString('pt-BR')}
              icon={<LinkClickIcon />}
              color="blue"
            />
          </div>
          <div className="funnel-step-arrow">↓</div>
          <div className="funnel-step funnel-step-2">
            <MetricCard
              label="Landing Page Views"
              value={totalLandingPageViews.toLocaleString('pt-BR')}
              icon={<LandingPageIcon />}
              color="green"
            />
          </div>
        </div>

        {/* Conector central */}
        <div className="traffic-funnel-connector">↔</div>

        {/* Coluna direita: métricas calculadas */}
        <div className="traffic-funnel-col">
          <div className="funnel-step funnel-step-0">
            <MetricCard
              label="CPM Medio"
              value={`R$ ${cpm.toFixed(2)}`}
              icon={<CPMIcon />}
              color="blue"
            />
          </div>
          <div className="funnel-step-arrow">↓</div>
          <div className="funnel-step funnel-step-1">
            <MetricCard
              label="CPC Medio"
              value={`R$ ${cpc.toFixed(2)}`}
              icon={<CPCIcon />}
              color="green"
            />
          </div>
          <div className="funnel-step-arrow">↓</div>
          <div className="funnel-step funnel-step-2">
            <MetricCard
              label="CTR Medio"
              value={`${ctr.toFixed(2)}%`}
              icon={<CTRIcon />}
              color="purple"
            />
          </div>
          <div className="funnel-step-arrow">↓</div>
          <div className="funnel-step funnel-step-3">
            <MetricCard
              label="Connect Rate"
              value={`${connectRate.toFixed(2)}%`}
              icon={<ConnectRateIcon />}
              color="orange"
            />
          </div>
          <div className="funnel-step-arrow">↓</div>
          <div className="funnel-step funnel-step-4">
            <MetricCard
              label="Taxa Conversao Pagina"
              value={`${pageConversionRate.toFixed(2)}%`}
              icon={<ConversionIcon />}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Anúncios */}
      <div className="table-responsive table-scrollable">
        <h3>Desempenho por Anuncio</h3>
        <table>
          <thead>
            <tr>
              <th>Anuncio</th>
              <th>Leads</th>
              <th>Gasto</th>
              <th>CPL</th>
              <th>CTR</th>
              <th>Taxa Conversao</th>
            </tr>
          </thead>
          <tbody>
            {groupedByAd.map((ad) => {
              const adCtr = calculateCTR(ad.link_clicks, ad.impressions);
              const adPageConversionRate = calculatePageConversionRate(
                ad.leads,
                ad.landing_page_views
              );
              const adCpl = calculateCPL(ad.spend, ad.leads);

              return (
                <tr key={ad.ad_name}>
                  <td>{ad.ad_name}</td>
                  <td>{ad.leads.toLocaleString('pt-BR')}</td>
                  <td>R$ {ad.spend.toFixed(2)}</td>
                  <td>R$ {adCpl.toFixed(2)}</td>
                  <td>{adCtr.toFixed(2)}%</td>
                  <td>{adPageConversionRate.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </section>

      {/* Seção Instagram - Seguidores */}
      {instagramData.length > 0 && (
        <section className="metricas-instagram">
          <h2>Instagram - Seguidores</h2>

          {/* Cards: Seguidores, Investimento, CPS */}
          <div className="funnel-container">
            <div className="funnel-item">
              <MetricCard
                label="Seguidores Ganhos"
                value={instagramData.reduce((sum, item) => sum + item.followers, 0).toLocaleString('pt-BR')}
                icon="👥"
                color="blue"
              />
            </div>
            <div className="funnel-arrow">→</div>
            <div className="funnel-item">
              <MetricCard
                label="Investimento"
                value={`R$ ${instagramData.reduce((sum, item) => sum + item.spend, 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                icon="💳"
                color="orange"
              />
            </div>
            <div className="funnel-arrow">→</div>
            <div className="funnel-item">
              <MetricCard
                label="CPS Médio"
                value={`R$ ${calculateCPS(
                  instagramData.reduce((sum, item) => sum + item.spend, 0),
                  instagramData.reduce((sum, item) => sum + item.followers, 0)
                ).toFixed(2)}`}
                icon="💰"
                color="green"
              />
            </div>
          </div>

          {/* Tabela de Criativos Instagram */}
          <div className="table-responsive table-scrollable">
            <h3>Criativos Instagram (ordenado por CPS)</h3>
            <table>
              <thead>
                <tr>
                  <th>Anúncio</th>
                  <th>Seguidores</th>
                  <th>Investimento</th>
                  <th>CPS</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(
                  instagramData.reduce((acc, item) => {
                    const key = item.ad_name;
                    if (!acc[key]) {
                      acc[key] = {
                        ad_name: key,
                        ad_id: item.ad_id,
                        followers: 0,
                        spend: 0,
                      };
                    }
                    acc[key].followers += item.followers;
                    acc[key].spend += item.spend;
                    return acc;
                  }, {} as Record<string, { ad_name: string; ad_id: string; followers: number; spend: number }>)
                )
                  .filter(ad => ad.followers > 0)
                  .sort((a, b) => {
                    const cpsa = calculateCPS(a.spend, a.followers);
                    const cpsb = calculateCPS(b.spend, b.followers);
                    return cpsa - cpsb;
                  })
                  .map((ad) => {
                    const cps = calculateCPS(ad.spend, ad.followers);
                    const adsManagerUrl = `https://www.facebook.com/adsmanager/manage/ads?selected_ad_ids=${ad.ad_id}`;

                    return (
                      <tr key={ad.ad_name}>
                        <td>
                          <a href={adsManagerUrl} target="_blank" rel="noopener noreferrer" title="Abrir no Ads Manager">
                            {ad.ad_name}
                          </a>
                        </td>
                        <td>{ad.followers.toLocaleString('pt-BR')}</td>
                        <td>R$ {ad.spend.toFixed(2)}</td>
                        <td>R$ {cps.toFixed(2)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
};
