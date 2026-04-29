import React, { useState, useEffect, useMemo } from 'react';
import { fetchSheetData } from '../lib/sheetsService';
import type { CruzamentoData } from '../lib/sheetsService';
import { MetricCard } from './MetricCard';
import { parseDate } from '../lib/dateUtils';
import { MetricasMetaAds } from './MetricasMetaAds';
import { fetchWindsorData, type WindsorMetrics } from '../lib/windsorService';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<CruzamentoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estado do Windsor
  const [windsorData, setWindsorData] = useState<WindsorMetrics[]>([]);
  const [loadingWindsor, setLoadingWindsor] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Carregar dados Windsor quando datas mudam
  useEffect(() => {
    if (!startDate || !endDate) {
      setWindsorData([]);
      return;
    }

    const loadWindsor = async () => {
      setLoadingWindsor(true);
      const data = await fetchWindsorData(startDate, endDate);
      setWindsorData(data);
      setLoadingWindsor(false);
    };

    loadWindsor();
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    const sheetData = await fetchSheetData();
    setData(sheetData);
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return data;

    return data.filter(item => {
      if (!item.dataConversao) return false;

      const itemDate = parseDate(item.dataConversao);
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');

      return itemDate >= start && itemDate <= end;
    });
  }, [data, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalVendas = filteredData.length;
    const totalFaturamento = filteredData.reduce((sum, item) => sum + item.valorVenda, 0);
    const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;
    const diasMediosConversao = totalVendas > 0
      ? filteredData.reduce((sum, item) => sum + item.diasConversao, 0) / totalVendas
      : 0;

    const totalSpend = windsorData.reduce((sum, item) => sum + item.spend, 0);
    const roas = totalSpend > 0 ? totalFaturamento / totalSpend : 0;

    const porUtmMedium = filteredData.reduce((acc, item) => {
      if (!acc[item.utmMedium]) {
        acc[item.utmMedium] = { vendas: 0, faturamento: 0 };
      }
      acc[item.utmMedium].vendas++;
      acc[item.utmMedium].faturamento += item.valorVenda;
      return acc;
    }, {} as Record<string, { vendas: number; faturamento: number }>);

    const porUtmContent = filteredData.reduce((acc, item) => {
      if (!acc[item.utmContent]) {
        acc[item.utmContent] = { vendas: 0, faturamento: 0 };
      }
      acc[item.utmContent].vendas++;
      acc[item.utmContent].faturamento += item.valorVenda;
      return acc;
    }, {} as Record<string, { vendas: number; faturamento: number }>);

    const criativosComRoas = Object.entries(porUtmContent)
      .map(([criativo, data]) => {
        const investimento = windsorData
          .filter(item => item.ad_name === criativo)
          .reduce((sum, item) => sum + item.spend, 0);

        return {
          criativo,
          vendas: data.vendas,
          faturamento: data.faturamento,
          investimento,
          roas: investimento > 0 ? data.faturamento / investimento : 0,
        };
      })
      .filter(item => item.vendas > 0)
      .sort((a, b) => b.faturamento - a.faturamento);

    return {
      totalVendas,
      totalFaturamento,
      ticketMedio,
      diasMediosConversao,
      totalSpend,
      roas,
      porUtmMedium: Object.entries(porUtmMedium).sort((a, b) => b[1].faturamento - a[1].faturamento).slice(0, 10),
      porUtmContent: Object.entries(porUtmContent).sort((a, b) => b[1].faturamento - a[1].faturamento).slice(0, 10),
      criativosComRoas,
    };
  }, [filteredData, windsorData]);

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard - Cruzamento Mentoria</h1>
        <p className="subtitle">Fabiano Pereira</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>De:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Até:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="btn-refresh" onClick={loadData} disabled={loading}>
          {loading ? 'Carregando...' : '🔄 Atualizar'}
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando dados...</div>
      ) : (
        <>
          <section className="metrics-section">
            <h2>Visão Geral da Operação</h2>
            <div className="metrics-grid">
              <MetricCard
                label="Total de Vendas"
                value={metrics.totalVendas}
                icon="🛍️"
                color="blue"
              />
              <MetricCard
                label="Faturamento Total"
                value={`R$ ${metrics.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon="💰"
                color="green"
              />
              <MetricCard
                label="Ticket Médio"
                value={`R$ ${metrics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon="📈"
                color="orange"
              />
              {windsorData.length > 0 && (
                <MetricCard
                  label="ROAS"
                  value={`${metrics.roas.toFixed(2)}x`}
                  icon="📊"
                  color="purple"
                />
              )}
            </div>
          </section>

          <MetricasMetaAds data={windsorData} loading={loadingWindsor} />

          <section className="metrics-section">
            <h2>Vendas por UTM Medium</h2>
            <div className="table-responsive table-scrollable">
              <table>
                <thead>
                  <tr>
                    <th>UTM Medium</th>
                    <th>Total de Vendas</th>
                    <th>Faturamento</th>
                    <th>Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.porUtmMedium.map(([medium, data]) => (
                    <tr key={medium}>
                      <td>{medium || 'Sem Medium'}</td>
                      <td>{data.vendas}</td>
                      <td>R$ {data.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>R$ {(data.faturamento / data.vendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="metrics-section">
            <h2>Vendas por UTM Content</h2>
            <div className="table-responsive table-scrollable">
              <table>
                <thead>
                  <tr>
                    <th>UTM Content</th>
                    <th>Total de Vendas</th>
                    <th>Faturamento</th>
                    <th>Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.porUtmContent.map(([content, data]) => (
                    <tr key={content}>
                      <td>{content || 'Sem Content'}</td>
                      <td>{data.vendas}</td>
                      <td>R$ {data.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>R$ {(data.faturamento / data.vendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="metrics-section">
            <h2>Desempenho de Criativos</h2>
            <div className="table-responsive table-scrollable">
              <table>
                <thead>
                  <tr>
                    <th>Criativo</th>
                    <th>Vendas</th>
                    <th>Faturamento</th>
                    <th>Investimento</th>
                    <th>ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.criativosComRoas.map((criativo) => (
                    <tr key={criativo.criativo}>
                      <td>{criativo.criativo || 'Sem Criativo'}</td>
                      <td>{criativo.vendas}</td>
                      <td>R$ {criativo.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>R$ {criativo.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>{criativo.roas.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
};
// Force rebuild
