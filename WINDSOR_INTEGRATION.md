# Integração de Dados do Windsor
## Plano de Implementação

**Status:** PLANEJADO  
**Data de Criação:** 28/04/2026

---

## 📋 Visão Geral

O dashboard atualmente puxa dados de **conversão e vendas** da aba "Cruzamento de Dados - Mentoria".

A próxima fase adiciona dados de **tráfego/leads** do Windsor, permitindo análise completa do funil:

```
Tráfego Windsor (impressões, cliques, leads)
    ↓
Leads Capturados
    ↓
Conversão (dados atuais do Cruzamento)
    ↓
Faturamento
```

---

## 🔧 Opções de Implementação

### Opção A: Mesma Aba, Novas Colunas (RECOMENDADO)
**Pros:**
- ✅ Simples de implementar
- ✅ Dados unificados em um lugar
- ✅ Fácil de manter
- ✅ Relacionamento 1-para-1 é natural

**Cons:**
- ❌ Aba fica com muitas colunas

**Implementação:**
1. Adicionar colunas ao lado (K em diante)
2. Preencher dados do Windsor
3. Atualizar mapeamento em `api/sheets.ts`
4. Criar componentes novos para métricas de tráfego

### Opção B: Aba Separada
**Pros:**
- ✅ Dados separados logicamente
- ✅ Mais flexível para dados de várias fontes

**Cons:**
- ❌ Precisa JOIN (mais complexo)
- ❌ Pode ter lags de sincronização

**Implementação:**
1. Criar aba "Windsor - Tráfego" no Sheets
2. `api/sheets.ts` busca ambas as abas
3. Frontend faz JOIN por email ou data
4. Mais complexo

---

## ✅ Recomendação: Opção A (Mesma Aba)

Adicionar colunas **K até S** com dados do Windsor:

```
A  → email (chave de relacionamento)
...H (dados atuais)...
K  → impressoes_windsor
L  → cliques_windsor
M  → leads_windsor
N  → cpc_windsor
O  → cpm_windsor
P  → data_dados_windsor
Q  → origem_campanha_windsor
R  → observacoes_windsor
```

---

## 📝 Passo a Passo de Implementação

### Fase 1: Estrutura do Google Sheets (30 min)

#### Step 1.1: Abrir planilha
- Ir para: https://docs.google.com/spreadsheets/d/1g-M-7UqI4DufsoXfkyjOkQiSXQOSW2p0A-IfeStKNTs
- Aba: "Cruzamento de Dados - Mentoria"

#### Step 1.2: Adicionar headers (coluna K em diante)
```
K: impressoes_windsor
L: cliques_windsor
M: leads_windsor
N: cpc_windsor
O: cpm_windsor
P: data_dados_windsor
Q: origem_campanha_windsor
R: observacoes_windsor
```

#### Step 1.3: Preencher dados do Windsor
- Obter dados do Windsor (admin/export)
- Relacionar por email (se possível) ou data
- Preencher colunas K até R para cada linha relevante
- Linhas sem dados Windsor deixar em branco

### Fase 2: Backend - Atualizar api/sheets.ts (20 min)

#### Step 2.1: Expandir interface CruzamentoData
Adicionar campos ao `CruzamentoData` interface:

```typescript
interface CruzamentoData {
  // ... campos existentes ...
  email: string;
  dataEntrada: string;
  dataConversao: string;
  valorVenda: number;
  utmMedium: string;
  utmContent: string;
  utmCampaign: string;
  utmTerm: string;
  diasConversao: number;
  
  // ✨ NOVOS CAMPOS WINDSOR
  impressoesWindsor: number;
  cliquesWindsor: number;
  leadsWindsor: number;
  cpcWindsor: number;
  cpmWindsor: number;
  dataWindsor: string;
  origemCampanhaWindsor: string;
  observacoesWindsor: string;
}
```

#### Step 2.2: Atualizar mapeamento em sheets.ts
```typescript
// Mapear colunas K-R
const impressoesWindsor = parseFloat(row[10]?.toString().trim() || '0');
const cliquesWindsor = parseFloat(row[11]?.toString().trim() || '0');
const leadsWindsor = parseFloat(row[12]?.toString().trim() || '0');

const cpcWindsor = parseFloat(
  row[13]?.toString().trim().replace(/R\$\s?/g, '').replace(',', '.') || '0'
);
const cpmWindsor = parseFloat(
  row[14]?.toString().trim().replace(/R\$\s?/g, '').replace(',', '.') || '0'
);

const dataWindsor = row[15]?.trim() || '';
const origemCampanhaWindsor = row[16]?.trim() || '';
const observacoesWindsor = row[17]?.trim() || '';

// Adicionar ao objeto de retorno
return {
  // ... campos existentes ...
  impressoesWindsor,
  cliquesWindsor,
  leadsWindsor,
  cpcWindsor,
  cpmWindsor,
  dataWindsor,
  origemCampanhaWindsor,
  observacoesWindsor,
};
```

#### Step 2.3: Testar API
```bash
curl https://dashboard-mentoria-cruzamento.vercel.app/api/sheets \
  | jq '.[0] | keys'
# Deve conter: impressoesWindsor, cliquesWindsor, etc.
```

### Fase 3: Frontend - Novos Componentes & Métricas (1-2 horas)

#### Step 3.1: Criar componente MetricasTrafego.tsx
Mostrar:
- Total de Impressões (som)
- Total de Cliques (som)
- Total de Leads (som)
- CTR (cliques / impressões)
- CPL Médio Windsor (faturamento / leads Windsor)

```typescript
interface MetricasTrafegoProps {
  data: CruzamentoData[];
}

export const MetricasTrafego: React.FC<MetricasTrafegoProps> = ({ data }) => {
  const totalImpressoes = data.reduce((sum, item) => sum + item.impressoesWindsor, 0);
  const totalCliques = data.reduce((sum, item) => sum + item.cliquesWindsor, 0);
  const totalLeads = data.reduce((sum, item) => sum + item.leadsWindsor, 0);
  
  const ctr = totalImpressoes > 0 ? (totalCliques / totalImpressoes * 100) : 0;
  // CTR = Click-Through Rate (%)
  
  const cplMedioWindsor = totalLeads > 0
    ? data.reduce((sum, item) => sum + item.cpcWindsor, 0) / totalLeads
    : 0;

  return (
    <section className="metricas-trafego">
      <h2>Tráfego & Leads (Windsor)</h2>
      <div className="metrics-grid">
        <MetricCard label="Impressões" value={totalImpressoes.toLocaleString('pt-BR')} icon="👁️" color="blue" />
        <MetricCard label="Cliques" value={totalCliques.toLocaleString('pt-BR')} icon="🖱️" color="orange" />
        <MetricCard label="Leads" value={totalLeads.toLocaleString('pt-BR')} icon="🎯" color="green" />
        <MetricCard label="CTR" value={`${ctr.toFixed(2)}%`} icon="📊" color="purple" />
      </div>
    </section>
  );
};
```

#### Step 3.2: Adicionar tabela "Análise de Funil"
Mostrar conversão completa:

```
Origem | Impressões | Cliques | Leads | Conversão | Vendas | Taxa Conversão
-------|------------|---------|-------|-----------|--------|---------------
Email  | 10.000     | 500     | 50    | 20%       | 10     | 20%
Social | 5.000      | 250     | 25    | 10%       | 5      | 20%
```

Cálculos:
- Taxa Cliques = (Cliques / Impressões) * 100
- Taxa Conversão Leads = (Leads / Cliques) * 100
- Taxa Conversão Vendas = (Vendas / Leads) * 100

#### Step 3.3: Adicionar tabela "Performance por Origem"
Agrupar por `origemCampanhaWindsor` e mostrar:
- CPM (Custo por mil impressões)
- CPC (Custo por clique)
- CPL (Custo por lead - calculado)
- Ticket Médio
- ROAS (Faturamento / Gasto Windsor)

```typescript
const performanceOrigin = data.reduce((acc, item) => {
  const origem = item.origemCampanhaWindsor || 'Sem Origem';
  if (!acc[origem]) {
    acc[origem] = {
      impressoes: 0,
      cliques: 0,
      leads: 0,
      gasto: 0,
      vendas: 0,
      faturamento: 0,
    };
  }
  acc[origem].impressoes += item.impressoesWindsor;
  acc[origem].cliques += item.cliquesWindsor;
  acc[origem].leads += item.leadsWindsor;
  acc[origem].gasto += item.leadsWindsor * item.cpcWindsor; // Custo total
  acc[origem].vendas++;
  acc[origem].faturamento += item.valorVenda;
  return acc;
}, {});

// Calcular métricas por origem
Object.entries(performanceOrigin).forEach(([origem, data]) => {
  const cpl = data.leads > 0 ? data.gasto / data.leads : 0;
  const roas = data.gasto > 0 ? data.faturamento / data.gasto : 0;
  // ... renderizar tabela
});
```

### Fase 4: Testes & Deploy (30 min)

#### Step 4.1: Teste local
```bash
npm run dev
# Abrir http://localhost:5173
# Verificar:
# - Novas métricas aparecem
# - Cálculos estão corretos
# - Sem console errors
```

#### Step 4.2: Deploy para Vercel
```bash
git add src/
git commit -m "feat: adicionar integração de dados do Windsor"
git push origin main
# Vercel faz deploy automaticamente
```

#### Step 4.3: Verificar em produção
```bash
# Abrir https://dashboard-mentoria-cruzamento.vercel.app
# Verificar que novas métricas aparecem
```

---

## 📊 Métricas Adicionadas

### Nível Global (Filtro por Data)
- **Impressões (Windsor)** - Total
- **Cliques (Windsor)** - Total
- **Leads (Windsor)** - Total
- **CTR (Click-Through Rate)** - (Cliques / Impressões) * 100
- **Custo Total** - Soma do gasto em ads
- **ROAS (Windsor)** - Faturamento / Custo Total

### Nível Origem Campanha
Tabela com colunas:
- Origem
- Impressões
- Cliques
- Taxa de Clique (%)
- Leads
- Taxa de Conversão (%)
- CPL (Custo por Lead)
- CPC (Custo por Clique)
- Vendas Originadas
- Faturamento
- ROAS

### Nível Funil Completo
```
Impressões → Cliques → Leads → Vendas
    ↓          ↓         ↓        ↓
  10k →      500 →     50 →     10
     5%       10%      20%
```

---

## 🔐 Considerações

- **Dados Sensíveis:** Custos em `cpcWindsor`, `cpmWindsor` - verificar permissões
- **Sincronização:** Dados Windsor precisam ser atualizados manualmente ou via API
- **Timezone:** Garantir que `dataWindsor` está no mesmo formato que `dataConversao`
- **Valores Faltantes:** Linhas sem dados Windsor continuam funcionando (valores zerados)

---

## 📋 Checklist de Implementação

### Preparação
- [ ] Obter dados completos do Windsor
- [ ] Estruturar dados em formato esperado
- [ ] Definir mapeamento email/data

### Google Sheets
- [ ] Adicionar headers (K-R)
- [ ] Preencher dados do Windsor
- [ ] Verificar que não quebrou dados existentes

### Backend
- [ ] Atualizar interface `CruzamentoData`
- [ ] Atualizar mapeamento em `api/sheets.ts`
- [ ] Testar API retorna novos campos

### Frontend
- [ ] Criar componente `MetricasTrafego.tsx`
- [ ] Adicionar tabela de Funil
- [ ] Adicionar tabela de Performance por Origem
- [ ] Estilizar componentes novos

### Testes
- [ ] Teste local sem erros
- [ ] Métricas calculadas corretamente
- [ ] Responsivo em mobile
- [ ] Deploy em Vercel funciona

### Documentação
- [ ] Atualizar IMPLEMENTATION_GUIDE.md
- [ ] Adicionar exemplos de novos cálculos
- [ ] Documentar novas interfaces/componentes

---

## ⏰ Estimativa de Esforço

| Fase | Horas | Riscos |
|------|-------|--------|
| Estrutura Sheets | 0.5 | Formato dados Windsor |
| Backend | 0.5 | Mapeamento coluna |
| Frontend | 2 | Lógica de cálculos |
| Testes | 0.5 | Valores batendo |
| **Total** | **3.5** | - |

---

## 🚀 Próximos Passos

1. Confirmar com usuário formato/estrutura dos dados Windsor
2. Preparar dados (export do Windsor)
3. Implementar Fase 1-2 (backend)
4. Testar retorno da API
5. Implementar Fase 3-4 (frontend + deploy)
6. Validar com cliente

---

**Documento criado:** 28/04/2026  
**Versão:** 1.0  
**Responsável:** Claude
