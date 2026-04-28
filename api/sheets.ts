import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1g-M-7UqI4DufsoXfkyjOkQiSXQOSW2p0A-IfeStKNTs';
const SHEET_NAME = 'Cruzamento de Dados - Mentoria';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Validar variáveis de ambiente
    if (
      !process.env.GOOGLE_PROJECT_ID ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_CLIENT_EMAIL
    ) {
      return res.status(500).json({
        error: 'Credenciais do Google não configuradas',
        message: 'Variáveis de ambiente necessárias não foram definidas',
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
        private_key: process.env.GOOGLE_PRIVATE_KEY,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL || '',
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    const headers = rows[0].map((h) => h?.trim().toLowerCase() || '');

    // Encontrar índices das colunas
    const findIndex = (keywords: string[]) => {
      return headers.findIndex((h) =>
        keywords.some((k) => h.includes(k.toLowerCase()))
      );
    };

    const emailIdx = findIndex(['email']);
    const dataEntradaIdx = findIndex(['data', 'entrada']);
    const dataConversaoIdx = findIndex(['conversao']);
    const valorVendaIdx = findIndex(['valor', 'venda']);
    const utmMediumIdx = findIndex(['utm_medium', 'utmmedium', 'medium']);
    const utmContentIdx = findIndex(['utm_content', 'utmcontent', 'content']);
    const utmCampaignIdx = findIndex(['utm_campaign', 'utmcampaign', 'campaign']);
    const utmTermIdx = findIndex(['utm_term', 'utmterm', 'term']);

    const data = rows.slice(1).map((row) => {
      const email = row[emailIdx] || '';
      const dataEntrada = row[dataEntradaIdx] || '';
      const dataConversao = row[dataConversaoIdx] || '';
      const valorVenda = parseFloat(row[valorVendaIdx]) || 0;
      const utmMedium = row[utmMediumIdx] || '';
      const utmContent = row[utmContentIdx] || '';
      const utmCampaign = row[utmCampaignIdx] || '';
      const utmTerm = row[utmTermIdx] || '';

      let diasConversao = 0;
      if (dataEntrada && dataConversao) {
        try {
          const entrada = parseDate(dataEntrada);
          const conversao = parseDate(dataConversao);
          diasConversao = Math.ceil(
            (conversao.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24)
          );
        } catch (e) {
          diasConversao = 0;
        }
      }

      return {
        email,
        dataEntrada,
        dataConversao,
        valorVenda,
        utmMedium,
        utmContent,
        utmCampaign,
        utmTerm,
        diasConversao,
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      details: process.env.NODE_ENV === 'development' ? JSON.stringify(error) : undefined,
    });
  }
}

function parseDate(dateString: string): Date {
  const parts = dateString.trim().split(' ');
  const dateParts = parts[0].split('/');
  const timeParts = parts[1]?.split(':') || [0, 0, 0];

  return new Date(
    parseInt(dateParts[2]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[0]),
    parseInt(timeParts[0]),
    parseInt(timeParts[1]),
    parseInt(timeParts[2])
  );
}
