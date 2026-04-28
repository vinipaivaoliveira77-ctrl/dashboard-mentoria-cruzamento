# Integração Meta Ads via Windsor API
## Plano de Implementação

**Status:** PRONTO PARA IMPLEMENTAR  
**Data:** 28/04/2026  
**Connector:** Meta Ads (Facebook)

---

## 📋 Visão Geral

Integrar dados de **Meta Ads (Facebook)** via **Windsor.ai API** no dashboard:

```
User seleciona data → API Windsor puxa Meta Ads dessa data
                   → API Sheets puxa Conversões dessa data
                   → Frontend combina e exibe lado a lado
```

---

## 🔌 API do Windsor - Detalhes Técnicos

### URL Base
```
https://connectors.windsor.ai
```

### Endpoint Meta Ads
```
GET https://connectors.windsor.ai/facebook
  ?api_key=7ad6ed416821918c34af83307733684ba89b
  &fields=date,impressions,link_clicks,page_views,leads,cpm,cpc,ctr,connect_rate,page_conversion_rate,spend,campaign_name,adset_name,ad_name
  &date_from=2026-04-27
  &date_to=2026-04-27
```

### Campos Solicitados
```
date                      → Data da campanha
impressions               → Impressões
link_clicks               → Cliques no link
page_views                → Visualizações de página
leads                     → Leads gerados
cpm                       → Custo por mil impressões
cpc                       → Custo por clique
ctr                       → Click-through rate (%)
connect_rate              → Taxa de conexão (métrica personalizada)
page_conversion_rate      → Taxa de conversão da página (métrica personalizada)
spend                     → Gasto em anúncios (R$)
campaign_name             → Nome da campanha
adset_name                → Nome do conjunto de anúncios
ad_name                   → Nome do anúncio
```

### Formato de Resposta (Esperado)
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-27",
      "campaign_name": "Mentoria - Email",
      "adset_name": "Email - Desktop",
      "ad_name": "Oferta especial",
      "impressions": 5000,
      "link_clicks": 250,
      "page_views": 200,
      "leads": 25,
      "cpm": 10.50,
      "cpc": 2.10,
      "ctr": 5.0,
      "connect_rate": 80,
      "page_conversion_rate": 12.5,
      "spend": 52.50
    },
    ...
  ]
}
```

---

## 🏗️ Arquitetura de Implementação

### Fase 1: Backend - Nova Função api/windsor.ts

#### Step 1.1: Criar arquivo `api/windsor.ts`

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'; // ou use fetch nativo do Node 18+

const WINDSOR_API_KEY = '7ad6ed416821918c34af83307733684ba89b';
const WINDSOR_BASE_URL = 'https://connectors.windsor.ai';
const CONNECTOR = 'facebook';

interface WindsorRecord {
  date: string;
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  impressions: number;
  link_clicks: number;
  page_views: number;
  leads: number;
  cpm: number;
  cpc: number;
  ctr: number;
  connect_rate: number;
  page_conversion_rate: number;
  spend: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extrair datas da query
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Datas obrigatórias',
        message: 'Forneça start_date e end_date (YYYY-MM-DD)',
      });
    }

    // Construir URL da API Windsor
    const fields = [
      'date',
      'impressions',
      'link_clicks',
      'page_views',
      'leads',
      'cpm',
      'cpc',
      'ctr',
      'connect_rate',
      'page_conversion_rate',
      'spend',
      'campaign_name',
      'adset_name',
      'ad_name',
    ].join(',');

    const windsorUrl = `${WINDSOR_BASE_URL}/${CONNECTOR}?api_key=${WINDSOR_API_KEY}&fields=${fields}&date_from=${start_date}&date_to=${end_date}`;

    // Chamar API Windsor
    const response = await fetch(windsorUrl);
    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(500).json({
        error: 'Erro ao buscar dados do Windsor',
        message: data.message || 'Erro desconhecido',
      });
    }

    // Processar e padronizar dados
    const records: WindsorRecord[] = (data.data || []).map((row: any) => ({
      date: row.date?.trim() || '',
      campaign_name: row.campaign_name?.trim() || '',
      adset_name: row.adset_name?.trim() || '',
      ad_name: row.ad_name?.trim() || '',
      impressions: parseFloat(row.impressions) || 0,
      link_clicks: parseFloat(row.link_clicks) || 0,
      page_views: parseFloat(row.page_views) || 0,
      leads: parseFloat(row.leads) || 0,
      cpm: parseFloat(row.cpm) || 0,
      cpc: parseFloat(row.cpc) || 0,
      ctr: parseFloat(row.ctr) || 0,
      connect_rate: parseFloat(row.connect_rate) || 0,
      page_conversion_rate: parseFloat(row.page_conversion_rate) || 0,
      spend: parseFloat(row.spend) || 0,
    }));

    // Cache de 1 hora (dados de Meta Ads não mudam tão frequentemente)
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json(records);
  } catch (error) {
    console.error('Erro ao buscar dados do Windsor:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
```

#### Step 1.2: Adicionar interface no frontend

Criar/atualizar `src/lib/windsorService.ts`:

```typescript
export interface WindsorMetrics {
  date: string;
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  impressions: number;
  link_clicks: number;
  page_views: number;
  leads: number;
  cpm: number;
  cpc: number;
  ctr: number;
  connect_rate: number;
  page_conversion_rate: number;
  spend: number;
}

export async function fetchWindsorData(
  startDate: string,
  endDate: string
): Promise<WindsorMetrics[]> {
  try {
    const response = await fetch(
      `/api/windsor?start_date=${startDate}&end_date=${endDate}`
    );

    if (!response.ok) {
      console.error('Erro ao buscar Windsor:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados do Windsor:', error);
    return [];
  }
}
```

---

### Fase 2: Frontend - Integração no Dashboard

#### Step 2.1: Atualizar Dashboard.tsx

Adicionar state e fetch:

```typescript
import { useEffect, useState } from 'react';
import { fetchWindsorData, type WindsorMetrics } from '../lib/windsorService';

export const Dashboard: React.FC = () => {
  // ... estado existente ...
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // NOVO: Estado do Windsor
  const [windsorData, setWindsorData] = useState<WindsorMetrics[]>([]);
  const [loadingWindsor, setLoadingWindsor] = useState(false);

  // NOVO: Carregar dados quando datas mudam
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

  // ... resto do código ...
};
```

#### Step 2.2: Criar componente MetricasMetaAds.tsx

```typescript
import React from 'react';
import { MetricCard } from './MetricCard';
import type { WindsorMetrics } from '../lib/windsorService';

interface MetricasMetaAdsProps {
  data: WindsorMetrics[];
  loading: boolean;
}

export const MetricasMetaAds: React.FC<MetricasMetaAdsProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="loading">Carregando dados do Meta Ads...</div>;
  }

  if (data.length === 0) {
    return null;
  }

  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.link_clicks, 0);
  const totalPageViews = data.reduce((sum, item) => sum + item.page_views, 0);
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpm = data.length > 0 ? data.reduce((sum, item) => sum + item.cpm, 0) / data.length : 0;
  const avgCpc = data.length > 0 ? data.reduce((sum, item) => sum + item.cpc, 0) / data.length : 0;
  const avgConnectRate = data.length > 0 ? data.reduce((sum, item) => sum + item.connect_rate, 0) / data.length : 0;
  const avgPageConversionRate = data.length > 0 ? data.reduce((sum, item) => sum + item.page_conversion_rate, 0) / data.length : 0;

  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const roas = totalSpend > 0 ? (data.reduce((sum, item) => sum + (item.leads * 100), 0)) / totalSpend : 0; // Exemplo simplificado

  return (
    <section className="metricas-meta">
      <h2>📊 Meta Ads - Dados do Período</h2>
      
      <div className="metrics-grid">
        <MetricCard
          label="Impressões"
          value={totalImpressions.toLocaleString('pt-BR')}
          icon="👁️"
          color="blue"
        />
        <MetricCard
          label="Cliques"
          value={totalClicks.toLocaleString('pt-BR')}
          icon="🖱️"
          color="orange"
        />
        <MetricCard
          label="Visualizações Página"
          value={totalPageViews.toLocaleString('pt-BR')}
          icon="📄"
          color="green"
        />
        <MetricCard
          label="Leads Gerados"
          value={totalLeads.toLocaleString('pt-BR')}
          icon="🎯"
          color="purple"
        />
        <MetricCard
          label="CTR"
          value={`${ctr.toFixed(2)}%`}
          icon="📈"
          color="cyan"
        />
        <MetricCard
          label="CPM Médio"
          value={`R$ ${avgCpm.toFixed(2)}`}
          icon="💰"
          color="yellow"
        />
        <MetricCard
          label="CPC Médio"
          value={`R$ ${avgCpc.toFixed(2)}`}
          icon="💵"
          color="red"
        />
        <MetricCard
          label="CPL"
          value={`R$ ${cpl.toFixed(2)}`}
          icon="🎁"
          color="pink"
        />
        <MetricCard
          label="Connect Rate Médio"
          value={`${avgConnectRate.toFixed(2)}%`}
          icon="🔗"
          color="indigo"
        />
        <MetricCard
          label="Taxa Conversão Página"
          value={`${avgPageConversionRate.toFixed(2)}%`}
          icon="✅"
          color="green"
        />
        <MetricCard
          label="Gasto Total"
          value={totalSpend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon="💳"
          color="dark"
        />
      </div>

      {/* Tabela de Campanhas */}
      <div className="table-responsive">
        <h3>Desempenho por Campanha</h3>
        <table>
          <thead>
            <tr>
              <th>Campanha</th>
              <th>Conjunto de Anúncios</th>
              <th>Anúncio</th>
              <th>Impressões</th>
              <th>Cliques</th>
              <th>Leads</th>
              <th>Gasto</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.campaign_name}</td>
                <td>{item.adset_name}</td>
                <td>{item.ad_name}</td>
                <td>{item.impressions.toLocaleString('pt-BR')}</td>
                <td>{item.link_clicks.toLocaleString('pt-BR')}</td>
                <td>{item.leads.toLocaleString('pt-BR')}</td>
                <td>R$ {item.spend.toFixed(2)}</td>
                <td>R$ {item.cpm.toFixed(2)}</td>
                <td>R$ {item.cpc.toFixed(2)}</td>
                <td>{item.ctr.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
```

#### Step 2.3: Renderizar no Dashboard

Adicionar no `Dashboard.tsx` (após seção de Cruzamento):

```typescript
return (
  <main className="dashboard">
    <div className="dashboard-header">
      <h1>📊 Dashboard - Cruzamento Mentoria</h1>
      <p className="subtitle">Fabiano Pereira</p>
    </div>

    {/* Filtros */}
    <div className="filters">
      {/* ... código existente ... */}
    </div>

    {/* Seções existentes do Cruzamento */}
    {/* ... MetricCard, tabelas UTM ... */}

    {/* ✨ NOVO: Seção do Meta Ads */}
    <MetricasMetaAds data={windsorData} loading={loadingWindsor} />
  </main>
);
```

---

## 🎯 Relacionamento de Dados

**Como funciona:**

```
User seleciona: De 27/04 até 27/04

↓

Frontend faz 2 chamadas em paralelo:
  1. GET /api/sheets?startDate=27/04&endDate=27/04
  2. GET /api/windsor?start_date=2026-04-27&end_date=2026-04-27

↓

Backend retorna:
  - api/sheets: Dados de conversão (email, utm, valor, etc)
  - api/windsor: Dados de Meta Ads (impressões, cliques, leads, spend)

↓

Frontend renderiza ambos lado a lado (não precisa de JOIN)
```

**Por que funciona:**
- Ambas as APIs retornam dados do mesmo período
- Não precisa relacionar por email/campaign (são contextos diferentes)
- User vê: "Nesse período, Meta Ads gerou 250 cliques e 25 leads. Desses 25 leads, 10 viraram vendas"

---

## 📝 Testes & Validação

### Step 1: Testar API Windsor Manualmente

```bash
curl "https://connectors.windsor.ai/facebook?api_key=7ad6ed416821918c34af83307733684ba89b&fields=date,impressions,link_clicks,leads,spend,campaign_name&date_from=2026-04-27&date_to=2026-04-27"
```

Esperado: JSON com dados de Meta Ads

### Step 2: Testar função api/windsor.ts

```bash
curl "http://localhost:3000/api/windsor?start_date=2026-04-27&end_date=2026-04-27"
```

Esperado: Array com dados processados

### Step 3: Teste no Dashboard

1. Abrir dashboard
2. Selecionar data (ex: 27/04)
3. Verificar:
   - Métricas do Cruzamento aparecem (vendas, faturamento)
   - Métricas do Meta Ads aparecem (impressões, cliques, leads)
   - Tabela de campanhas está preenchida
   - Cálculos estão corretos

### Step 4: Verificar Cálculos

```
Verificar que:
- CPL Windsor = Gasto Total / Leads Totais
- CTR = (Cliques / Impressões) * 100
- CPM = (Gasto / Impressões) * 1000 (ou retornado direto)
- CPC = Gasto / Cliques
```

---

## 📋 Checklist de Implementação

### Backend
- [ ] Criar `api/windsor.ts`
- [ ] Testar API Windsor com curl
- [ ] Validar retorno de dados
- [ ] Adicionar tratamento de erros
- [ ] Cachear resposta (3600s)

### Frontend
- [ ] Criar `src/lib/windsorService.ts`
- [ ] Criar `src/components/MetricasMetaAds.tsx`
- [ ] Adicionar state e useEffect em Dashboard.tsx
- [ ] Renderizar componente novo
- [ ] Estilizar tabelas

### Testes
- [ ] Teste manual com data específica
- [ ] Verificar console sem erros
- [ ] Validar cálculos
- [ ] Teste responsivo mobile
- [ ] Teste com intervalos largos (mês inteiro)

### Deploy
- [ ] Commit e push
- [ ] Vercel faz deploy
- [ ] Testar em produção
- [ ] Validar com cliente

---

## ⏰ Estimativa

| Etapa | Horas |
|-------|-------|
| Backend (api/windsor.ts) | 0.5 |
| Frontend (components) | 1.5 |
| Testes | 0.5 |
| Deploy | 0.25 |
| **Total** | **2.75 horas** |

---

## ✅ Resultado Final

Após implementação, o dashboard terá:

**Seção 1: Cruzamento de Dados (Atual)**
- Métricas de conversão (vendas, faturamento, ticket, dias)
- Análise por UTM Medium/Content

**Seção 2: Meta Ads (NOVO)**
- Métricas de tráfego (impressões, cliques, leads)
- Desempenho por campanha/adset/anúncio
- CPM, CPC, CTR, Connect Rate, Taxa Conversão Página
- Gasto total

**Sincronização:**
- Ambas as seções filtram pela MESMA data
- User vê funil completo: Tráfego → Leads → Conversão

---

**Documento versão:** 1.0  
**Próximo passo:** Confirmar que plan está bom e começar implementação
