# Dashboard Mentoria - Cruzamento de Dados

Dashboard interativo para análise de dados de cruzamento de leads e vendas da mentoria.

## Visão Geral

Este dashboard analisa dados do Google Sheets (aba "Cruzamento de Dados - Mentoria"), apresentando métricas de conversão, análise por UTM Medium e UTM Content, com filtros por data.

## Features

- Métricas Gerais: Total de Vendas, Faturamento, Ticket Médio, Dias até Conversão
- Análise por UTM Medium com ranking de faturamento
- Análise por UTM Content com ranking de faturamento
- Filtros por data (De/Até)
- Design responsivo com branding Atlas Scale
- Fallback com dados mock para testes

## Stack Tecnológico

- React 18 + TypeScript
- Vite para build/dev
- Google Sheets API (backend serverless)
- Vercel para deployment

## Instalação Local

```bash
npm install
npm run dev
```

Acessa em http://localhost:5173

## Build para Produção

```bash
npm run build
npm run preview
```

## Integração Google Sheets

Atualmente o dashboard usa dados mock para demonstração. Para conectar ao Google Sheets:

1. Uma função serverless em `api/sheets.ts` irá buscar dados da aba "Cruzamento de Dados - Mentoria"
2. O endpoint será disponibilizado em `/api/sheets`
3. Service account credentials serão configurados como variáveis de ambiente no Vercel

## Estrutura de Dados

Esperada interface `CruzamentoData`:
- email: string
- utmMedium: string
- utmContent: string
- utmCampaign: string
- utmTerm: string
- dataEntrada: string (formato DD/MM/YYYY HH:MM:SS)
- valorVenda: number
- dataConversao: string (formato DD/MM/YYYY HH:MM:SS)
- diasConversao: number
- observacao: string

## Deployment

O projeto está pronto para deployment em Vercel. Após conectar o repositório:

1. Variáveis de ambiente necessárias:
   - GOOGLE_SHEETS_ID
   - GOOGLE_SHEETS_TAB_NAME
   - GOOGLE_SERVICE_ACCOUNT_*

2. Build command: `npm run build`
3. Output directory: `dist`

## Notas

Este dashboard funciona independentemente do Dashboard de Cálculo de Metas. Ambos são aplicações separadas com propósitos distintos.
