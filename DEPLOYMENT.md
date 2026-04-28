# Guia de Deployment

## Passo 1: Criar Repositório no GitHub

Execute os comandos abaixo no terminal (dentro do diretório do projeto):

```bash
# Adicione o repositório remoto
git remote add origin https://github.com/seu-usuario/dashboard-mentoria-cruzamento.git

# Renomeie a branch (se necessário)
git branch -M main

# Envie o código para GitHub
git push -u origin main
```

**Nota:** Substitua `seu-usuario` pelo seu username do GitHub.

Você também pode criar o repositório manualmente no GitHub antes de rodar esses comandos:
1. Acesse https://github.com/new
2. Crie um repositório público chamado `dashboard-mentoria-cruzamento`
3. Siga as instruções do GitHub para conectar seu repositório local

## Passo 2: Deploy no Vercel

### Opção A: Deploy via GitHub (Recomendado)

1. Acesse https://vercel.com/dashboard
2. Clique em "Add New" → "Project"
3. Selecione "Import Git Repository"
4. Autentique com GitHub e selecione `dashboard-mentoria-cruzamento`
5. Configure:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Clique em "Deploy"

### Opção B: Deploy via CLI

```bash
# Instale Vercel CLI (primeira vez apenas)
npm install -g vercel

# Deploy do projeto
vercel

# Para deployments subsequentes
vercel --prod
```

## Passo 3: Configurar Google Sheets API

Após deployment no Vercel, crie um arquivo `api/sheets.ts` para buscar dados do Google Sheets:

```typescript
import { google } from 'googleapis';

const sheets = google.sheets('v4');

export default async function handler(req, res) {
  try {
    // Será implementado com credenciais de service account
    res.status(200).json({ data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Configure as variáveis de ambiente no Vercel:
1. Acesse seu projeto no Vercel
2. Settings → Environment Variables
3. Adicione:
   - `GOOGLE_SHEETS_ID`: ID da planilha
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Email da conta de serviço
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: Chave privada em formato JSON

## Verificação Final

Após deploy:

1. Acesse a URL fornecida pelo Vercel
2. Verifique se o dashboard carrega com dados mock
3. Teste filtros de data
4. Confirme que tabelas de UTM Medium e UTM Content aparecem

## Troubleshooting

### Erro: "Cannot find module 'googleapis'"

O módulo será usado apenas em serverless functions. Para o frontend, usar sempre dados mock.

### Dashboard não carrega no Vercel

Verifique:
- Build logs no Vercel dashboard
- Se `npm run build` executa sem erros localmente
- Se todas as dependências estão em `package.json`

### Dados não atualizam

Os dados mock aparecem por padrão. A função serverless `/api/sheets` será implementada após Google Sheets API estar configurada.
