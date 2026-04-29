# Dashboard Mentoria - Especificações Funcionais (Congeladas)

**Data:** 29/04/2026  
**Status:** Funcionalidades CONGELADAS para mudanças de design apenas

---

## 1. Interfaces de Dados

### CruzamentoData (Google Sheets)
```typescript
interface CruzamentoData {
  email: string;
  nome?: string;
  utmMedium: string;
  utmContent: string;      // ⚠️ CRÍTICO: Corresponde a ad_name do Windsor
  utmCampaign: string;
  utmTerm: string;
  utmSource?: string;
  telefone?: string;
  dataEntrada: string;      // Formato: DD/MM/YYYY
  valorVenda: number;       // Valor em reais
  dataConversao: string;    // Formato: DD/MM/YYYY (usado para filtro)
  diasConversao: number;    // Calculado: conversão - entrada
}
```

### WindsorMetrics (Meta Ads API)
```typescript
interface WindsorMetrics {
  date: string;
  impressions: number;
  clicks: number;           // NÃO USADO
  link_clicks: number;      // ⚠️ CRÍTICO: Usado em CPC e CTR
  landing_page_views: number;
  leads: number;
  spend: number;            // Investimento em R$
  cpm: number;              // NÃO USADO (calculado no front)
  cpc: number;              // NÃO USADO (calculado no front)
  ctr: number;              // NÃO USADO (calculado no front)
  campaign_name: string;    // Filtrado: contém "PPTOMentoria"
  adset_name: string;       // Não usado
  ad_name: string;          // ⚠️ CRÍTICO: Corresponde a utm_content
}
```

---

## 2. Funções de Cálculo (windsorService.ts)

### CPM - Custo por Mil Impressões
```typescript
calculateCPM(spend: number, impressions: number): number
// = (spend / impressions) * 1000
// Mostra quanto custa para 1000 impressões
```

### CPC - Custo por Clique
```typescript
calculateCPC(spend: number, linkClicks: number): number
// = spend / linkClicks
// ⚠️ USA link_clicks (não clicks genéricos)
```

### CTR - Click-Through Rate
```typescript
calculateCTR(linkClicks: number, impressions: number): number
// = (linkClicks / impressions) * 100 [%]
// ⚠️ USA link_clicks (não clicks genéricos)
```

### Connect Rate
```typescript
calculateConnectRate(landing_page_views: number, link_clicks: number): number
// = (landing_page_views / link_clicks) * 100 [%]
// Taxa de visitantes que chegam na landing page
```

### Taxa de Conversão da Página
```typescript
calculatePageConversionRate(leads: number, landing_page_views: number): number
// = (leads / landing_page_views) * 100 [%]
// Taxa de leads gerados vs visitantes
```

### CPL - Custo por Lead
```typescript
calculateCPL(spend: number, leads: number): number
// = spend / leads
// Quanto custou cada lead gerado
```

---

## 3. Agregações e Cruzamentos (Dashboard.tsx)

### Filtro de Data
```typescript
filteredData = data.filter(item => {
  const itemDate = parseDate(item.dataConversao);
  return itemDate >= startDate && itemDate <= endDate;
});
```
- Usa `dataConversao` (não dataEntrada)
- Range: 00:00 do primeiro dia até 23:59 do último dia

### Métricas Globais
```typescript
totalVendas = filteredData.length
totalFaturamento = filteredData.reduce(sum + item.valorVenda)
ticketMedio = totalFaturamento / totalVendas
totalSpend = windsorData.reduce(sum + item.spend)
roas = totalFaturamento / totalSpend
```

### Vendas por UTM Medium
```typescript
porUtmMedium = filteredData.reduce((acc, item) => {
  acc[item.utmMedium] = {
    vendas: count,
    faturamento: sum
  }
})
// Top 10 por faturamento
```

### Vendas por UTM Content
```typescript
porUtmContent = filteredData.reduce((acc, item) => {
  acc[item.utmContent] = {
    vendas: count,
    faturamento: sum
  }
})
// Top 10 por faturamento
```

### Desempenho de Criativos (Cruzamento Crítico)
```typescript
criativosComRoas = porUtmContent.map(([criativo, data]) => {
  // Buscar investimento correspondente no Windsor
  const investimento = windsorData
    .filter(item => item.ad_name === criativo)  // ⚠️ MATCH KEY: utm_content = ad_name
    .reduce(sum + item.spend);
  
  return {
    criativo,
    vendas: data.vendas,
    faturamento: data.faturamento,
    investimento,
    roas: faturamento / investimento
  }
})
// Apenas criativos com vendas > 0
// Ordenado por faturamento DESC
```

---

## 4. Cache Strategy (Auto-Refresh às 10h)

### API Cache
- `api/windsor.ts`: `Cache-Control: public, max-age=300` (5 minutos)
- `api/sheets.ts`: `Cache-Control: public, max-age=300` (5 minutos)

### Cache-Busting (Client-Side)
Implementado em `windsorService.ts` e `sheetsService.ts`:

```typescript
// Cada dia após 10h, primeiro fetch ignora cache
const now = new Date();
const today = now.toLocaleDateString('pt-BR');
const refreshKey = `windsor_daily_refresh_${today}`;

let url = `/api/endpoint`;
if (now.getHours() >= 10 && !sessionStorage.getItem(refreshKey)) {
  url += `?bust=${Date.now()}`;  // Força nova busca
  sessionStorage.setItem(refreshKey, 'true');
}
```

**Comportamento:**
- Após 10h: primeira busca = dados frescos garantidos
- Mesma sessão: buscas subsequentes usam cache 5min
- Próxima sessão/dia: ciclo reinicia

---

## 5. Estrutura de Componentes

### MetricasMetaAds.tsx
Exibe dados de tráfego do Windsor:
- **Funil Visual (2 colunas):**
  - Esquerda: Impressões (100%) → Link Clicks (85%) → Landing Page Views (70%)
  - Direita: CPM → CPC → CTR → Connect Rate → Taxa Conversão Página
- **Tabela Desempenho por Anúncio:**
  - Colunas: Anuncio, Leads, Gasto, CPL, CTR, Taxa Conversao
  - Agrupado por ad_name, ordenado por gasto DESC

### Dashboard.tsx
Render order:
1. Visão Geral da Operação (4 cards: Vendas, Faturamento, Ticket Médio, ROAS)
2. MetricasMetaAds (Tráfego)
3. Desempenho de Criativos
4. Vendas por UTM Medium (Top 10)
5. Vendas por UTM Content (Top 10)

---

## 6. Críticos para Manutenção

1. **utm_content = ad_name**: Chave de cruzamento entre Sheets e Windsor
2. **link_clicks (não clicks)**: Usado em CPC e CTR - NUNCA alterar
3. **dataConversao (não dataEntrada)**: Campo usado para filtro de datas
4. **Cache-busting session**: Usa sessionStorage, válido apenas durante sessão aberta
5. **Formatação**: Sempre `pt-BR` para números e moeda

---

## 7. Endpoints Vercel

- `GET /api/sheets` → CruzamentoData[]
- `GET /api/windsor?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` → WindsorMetrics[]

**Filtro Windsor:** Apenas campanhas com `campaign_name` contendo "PPTOMentoria"

---

**Status:** ✅ Funcionalidades CONGELADAS - Próximas mudanças serão apenas DESIGN
