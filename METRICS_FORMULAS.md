# Fórmulas de Métricas Meta Ads - Dashboard Mentoria

## Configuração Aprovada (28/04/2026)

Todas as métricas abaixo estão implementadas em `src/lib/windsorService.ts` e usadas em `src/components/MetricasMetaAds.tsx`.

### Métricas Básicas (do Windsor API)
- **Impressões** - visualizações do anúncio
- **Cliques** - cliques genéricos no anúncio
- **Link Clicks** - cliques no link do anúncio ⭐
- **Landing Page Views** - visualizações da página de destino
- **Leads** - leads capturados
- **Gasto** - investimento em R$

### Métricas Calculadas

#### CPM (Custo Por Mil Impressões)
```
CPM = (Gasto / Impressões) × 1000
```
**Unidade:** R$

#### CPC (Custo Por Clique) ⭐ IMPORTANTE
```
CPC = Gasto / Link Clicks
```
**Nota:** Usa `link_clicks` e NÃO `clicks`. Crítico para números corretos.
**Unidade:** R$

#### CTR (Click-Through Rate) ⭐ IMPORTANTE
```
CTR = (Link Clicks / Impressões) × 100
```
**Nota:** Usa `link_clicks` e NÃO `clicks`. Crítico para números corretos.
**Unidade:** %

#### Connect Rate
```
Connect Rate = (Landing Page Views / Link Clicks) × 100
```
**Unidade:** %

#### Taxa de Conversão na Página
```
Taxa Conversão = (Leads / Landing Page Views) × 100
```
**Unidade:** %

#### CPL (Custo Por Lead)
```
CPL = Gasto / Leads
```
**Unidade:** R$

#### ROAS (Return on Ad Spend) ⭐ NOVO
```
ROAS = Faturamento Total / Gasto Total em Tráfego
```
**Nota:** Calcula faturamento da Mentoria (Google Sheets) dividido pelo investimento total em tráfego (Windsor Meta Ads). Só aparece no dashboard quando há dados de tráfego.
**Unidade:** Multiplicador (x) - ex: 10x = cada real gasto retorna 10

## Filtros Aplicados
- **Campanhas:** Apenas campanhas contendo "PPTOMentoria" no nome
- **Campo 'actions':** Extrai `landing_page_view` e `lead` do array de ações
- **Cache:** 1 hora (max-age=3600)

## Estrutura do Dashboard
**Ordem das seções (28/04/2026):**
1. **Visão Geral da Operação** - Total Vendas, Faturamento, Ticket Médio, Dias Conversão, ROAS
2. **Meta Ads** - Tráfego pago (12 cards de métricas + tabela por campanha)
3. **Vendas por UTM Medium** - Top 10 mediums por faturamento
4. **Vendas por UTM Content** - Top 10 criativos por faturamento

## Localização do Código
- **Dashboard principal:** `src/components/Dashboard.tsx` (ROAS calculado no useMemo)
- **Funções de cálculo Windsor:** `src/lib/windsorService.ts` (linhas 64-79)
- **Seção Meta Ads:** `src/components/MetricasMetaAds.tsx`
- **Endpoint API:** `api/windsor.ts`
