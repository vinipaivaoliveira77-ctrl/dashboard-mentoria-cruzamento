# Dashboard Mentoria - Cruzamento de Dados
## Guia de Implementação Técnica

**Data de Criação:** 28/04/2026  
**Última Atualização:** 28/04/2026  
**Status:** COMPLETO E FUNCIONAL

---

## 📋 Índice de Arquivos Críticos

### Backend (Vercel Serverless)
- **`api/sheets.ts`** - Função que busca dados do Google Sheets via API

### Frontend (React + Vite)
- **`src/components/Dashboard.tsx`** - Componente principal com filtros e métricas
- **`src/components/MetricCard.tsx`** - Card reutilizável para métrica
- **`src/lib/sheetsService.ts`** - Interface de comunicação com API
- **`src/lib/dateUtils.ts`** - Parsing de datas em formato brasileiro
- **`src/styles/dashboard.css`** - Estilos (design Atlas Scale)

### Configuração
- **`vercel.json`** - Deploy config
- **`.env.example`** - Template de variáveis
- **`vite.config.ts`** - Build config com exclusão de googleapis

---

## 🔌 Integração Google Sheets

### Spreadsheet
- **ID:** `1g-M-7UqI4DufsoXfkyjOkQiSXQOSW2p0A-IfeStKNTs`
- **Aba:** "Cruzamento de Dados - Mentoria"
- **Range:** `A:Z` (colunas A até Z)

### Mapeamento de Colunas
```
A (0)  → email
B (1)  → utm_medium
C (2)  → utm_content
D (3)  → utm_campaign
E (4)  → utm_term
F (5)  → data_entrada
G (6)  → valor_venda (com formato R$)
H (7)  → data_conversao (USADO PARA FILTRO)
I (8)  → dias_conversao (calculado)
J (9)  → observacao
```

### Autenticação
- **Tipo:** Service Account Google Cloud
- **Scopes:** `https://www.googleapis.com/auth/spreadsheets.readonly`
- **Variáveis Vercel:**
  - `GOOGLE_PROJECT_ID`
  - `GOOGLE_PRIVATE_KEY_ID`
  - `GOOGLE_PRIVATE_KEY` (com `\n` literais para quebras)
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_X509_CERT_URL`

---

## 🏗️ Arquitetura

### Data Flow
```
Google Sheets
    ↓
api/sheets.ts (Vercel)
    ↓ (GET /api/sheets)
Frontend (React)
    ↓
Dashboard.tsx (filtro + cálculos)
    ↓
MetricCard + Tabelas
```

### State Management
- Estado centralizado em `Dashboard.tsx` com `useState`
- Cálculos memoizados com `useMemo`
- Sem Redux/Context (MVP simples)

### Cálculos Implementados
```typescript
// Em Dashboard.tsx
const filteredData = useMemo(() => {
  // Filtra por dataConversao (coluna H)
  // CRÍTICO: Usa SEMPRE dataConversao, NUNCA dataEntrada
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
  const totalFaturamento = filteredData.reduce(
    (sum, item) => sum + item.valorVenda, 0
  );
  const ticketMedio = totalVendas > 0 
    ? totalFaturamento / totalVendas 
    : 0;
  // ... resto dos cálculos
}, [filteredData]);
```

---

## 💰 Tratamento de Valores (CRÍTICO)

### Conversão de Formato Brasileiro
**Entrada do Google Sheets:** `"R$ 1.987,50"`  
**Processamento em `api/sheets.ts`:**

```typescript
const valorStr = row[6]?.toString().trim() || '0';
const valorLimpo = valorStr
  .replace(/R\$\s?/g, '')     // Remove "R$"
  .replace(/\./g, '')          // Remove separador de milhares (.)
  .replace(',', '.')           // Converte vírgula em ponto
  .trim();
const valorVenda = parseFloat(valorLimpo) || 0;
```

**Saída no Frontend:**
```typescript
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
// 1987.50 → "R$ 1.987,50"
```

---

## 📅 Parsing de Datas (CRÍTICO)

### Formato Esperado
**Google Sheets:** `"27/04/2026 14:30:00"` ou `"27/04/2026"`

**Implementação em `src/lib/dateUtils.ts`:**
```typescript
function parseDate(dateString: string): Date {
  if (!dateString || dateString.trim() === '') {
    return new Date(0);
  }

  const parts = dateString.trim().split(' ');
  const dateParts = parts[0].split('/');

  if (dateParts.length < 3) {
    return new Date(0);
  }

  const timeParts = parts[1]?.split(':') || [0, 0, 0];
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
  const year = parseInt(dateParts[2], 10);
  const hour = parseInt(timeParts[0], 10) || 0;
  const minute = parseInt(timeParts[1], 10) || 0;
  const second = parseInt(timeParts[2], 10) || 0;

  return new Date(year, month, day, hour, minute, second);
}
```

### Uso no Filtro
```typescript
// No Dashboard.tsx
const itemDate = parseDate(item.dataConversao);
const start = new Date(startDate + 'T00:00:00'); // HTML date picker
const end = new Date(endDate + 'T23:59:59');
return itemDate >= start && itemDate <= end;
```

---

## 📊 Métricas Calculadas

### Step 1: Métricas Gerais
- **Total de Vendas** - quantidade de registros com dataConversao
- **Faturamento Total** - soma de valorVenda
- **Ticket Médio** - Faturamento / Vendas
- **Dias até Conversão** - média de diasConversao

### Step 2: Vendas por UTM Medium
- Agrupa por `utmMedium`
- Calcula: vendas (count), faturamento (sum)
- Ordena por faturamento (DESC)
- Top 10 renderizados

### Step 3: Vendas por UTM Content
- Agrupa por `utmContent`
- Calcula: vendas (count), faturamento (sum)
- Ordena por faturamento (DESC)
- Top 10 renderizados

---

## 🚀 Endpoints da API

### GET `/api/sheets`
**Retorna:** Array de objetos com estrutura:
```typescript
interface CruzamentoData {
  email: string;
  dataEntrada: string;
  dataConversao: string;
  valorVenda: number;
  utmMedium: string;
  utmContent: string;
  utmCampaign: string;
  utmTerm: string;
  diasConversao: number;
}
```

**Headers:**
- `Cache-Control: public, max-age=60` (cache de 60 segundos)

**Erros:**
- **500** - Credenciais não configuradas ou erro na API

---

## 🔧 Como Manter/Evoluir

### Adicionar Nova Coluna no Google Sheets
1. Inserir coluna em posição conhecida (ex: coluna K = índice 10)
2. Atualizar mapeamento em `api/sheets.ts`
3. Adicionar campo em `CruzamentoData` interface
4. Usar nos cálculos/componentes

### Mudar Filtro de Data
⚠️ **CRÍTICO:** Dashboard usa `dataConversao` (coluna H) SEMPRE.  
Se precisar mudar para outra data, alterar em:
1. `Dashboard.tsx` - Linha do `parseDate(item.dataConversao)`
2. Adicionar comentário explicando por quê
3. Fazer commit descritivo

### Otimizar Performance
- Dashboard já usa `useMemo` para cálculos
- API retorna ~50-100 registros (performance OK)
- Se crescer, considerar paginação ou agregação no backend

### Adicionar Métrica Nova
1. Calcular em `useMemo` dentro de `metrics`
2. Renderizar em novo `<MetricCard>`
3. Testar manualmente

---

## 🐛 Problemas Conhecidos & Soluções

| Problema | Causa | Solução | Status |
|----------|-------|--------|--------|
| Valores zerados | Formato brasileiro (R$) não convertido | Regex multi-step | ✅ Resolvido |
| Filtro retorna vazio | Usando dataEntrada em vez de dataConversao | CRÍTICO: Sempre usar coluna H | ✅ Resolvido |
| Credenciais não funcionam | GOOGLE_PRIVATE_KEY sem `\n` | Adicionar `\n` literais no Vercel | ✅ Resolvido |
| Dia 27 não puxa dados | Parsing incorreto com timezone | Melhorar parseDate | ✅ Resolvido |

---

## 🧪 Testes Manuais

### Cenário 1: Inserir novo lead com conversão
1. Adicionar linha no Google Sheets com data de hoje
2. Esperar ~60 segundos (cache)
3. Recarregar dashboard
4. Verificar que métrica "Total de Vendas" incrementou

### Cenário 2: Filtrar por data específica
1. Abrir dashboard
2. Inserir "De: 27/04/2026"
3. Inserir "Até: 27/04/2026"
4. Verificar que apenas dados de 27/04 aparecem

### Cenário 3: Verificar ROAS e ticket médio
1. Abrir dashboard sem filtro
2. Verificar: `Faturamento / Vendas = Ticket Médio`
3. Verificar que conversão está correta

---

## 📝 Deploy & Monitoring

### Deploy
```bash
# Vercel faz auto-deploy ao fazer push para main
git push origin main
# Vercel reconstrói em ~1 minuto
# Verificar em: https://dashboard-mentoria-cruzamento.vercel.app
```

### Logs
- Vercel Dashboard → Deployments → Function Logs
- Procurar por "Erro ao buscar dados do Google Sheets"
- Verificar credenciais se houver erro 500

### Health Check
```bash
curl https://dashboard-mentoria-cruzamento.vercel.app/api/sheets | jq '.length'
# Deve retornar número > 0
```

---

## 🔐 Segurança

- ✅ Credenciais em variáveis Vercel (nunca em git)
- ✅ Escopo READ-ONLY (sem permissão de escrita)
- ✅ API googleappis nunca roda no navegador
- ✅ Frontend consome apenas dados já processados

---

## 📚 Referências de Código

### Converter Valor com Formato Brasileiro
```typescript
// Entrada: "R$ 1.987,50"
// Saída: 1987.50
const valorStr = "R$ 1.987,50";
const valorLimpo = valorStr
  .replace(/R\$\s?/g, '')
  .replace(/\./g, '')
  .replace(',', '.')
  .trim();
const valor = parseFloat(valorLimpo); // 1987.5
```

### Parsear Data DD/MM/YYYY
```typescript
// Entrada: "27/04/2026 14:30:00"
const dateString = "27/04/2026 14:30:00";
const [datePart, timePart] = dateString.split(' ');
const [day, month, year] = datePart.split('/').map(Number);
const [hour, minute, second] = (timePart || '0:0:0').split(':').map(Number);
const date = new Date(year, month - 1, day, hour, minute, second);
```

### Filtrar por Intervalo de Datas
```typescript
// Input: startDate="2026-04-27", endDate="2026-04-28"
const start = new Date(startDate + 'T00:00:00');
const end = new Date(endDate + 'T23:59:59');
const filtered = data.filter(item => {
  const itemDate = parseDate(item.dataConversao);
  return itemDate >= start && itemDate <= end;
});
```

### Agrupar por Chave e Somar
```typescript
const porUtmMedium = data.reduce((acc, item) => {
  if (!acc[item.utmMedium]) {
    acc[item.utmMedium] = { vendas: 0, faturamento: 0 };
  }
  acc[item.utmMedium].vendas++;
  acc[item.utmMedium].faturamento += item.valorVenda;
  return acc;
}, {});

// Converter para array e ordenar
const sorted = Object.entries(porUtmMedium)
  .sort((a, b) => b[1].faturamento - a[1].faturamento)
  .slice(0, 10);
```

---

## ✅ Checklist para Manutenção

- [ ] Deploy em Vercel funcionando
- [ ] Credenciais de Google Cloud atualizadas
- [ ] API retorna dados sem erro 500
- [ ] Dashboard carrega sem console errors
- [ ] Métricas batendo com valores esperados
- [ ] Filtro de data funciona corretamente
- [ ] Formatação de moeda em BRL
- [ ] Top 10 UTM Medium/Content ordenado por faturamento
- [ ] Cache de 60 segundos funcionando
- [ ] Responsivo em mobile

---

**Última manutenção:** 28/04/2026  
**Próximo passo:** Integração do Windsor (novos dados de tráfego)
