import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1g-M-7UqI4DufsoXfkyjOkQiSXQOSW2p0A-IfeStKNTs';
const SHEET_NAME = 'Cruzamento de Dados - Mentoria';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A:K`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) => ({
      email: row[0] || '',
      nome: row[1] || '',
      dataEntrada: row[2] || '',
      utmSource: row[3] || '',
      utmCampaign: row[4] || '',
      utmContent: row[5] || '',
      utmMedium: row[6] || '',
      telefone: row[7] || '',
      utmTerm: row[8] || '',
      dataConversao: row[9] || '',
      valorVenda: parseFloat(row[10]) || 0,
    }));

    // Calcular dias de conversão
    const dataWithDias = data.map((item) => {
      if (!item.dataEntrada || !item.dataConversao) {
        return { ...item, diasConversao: 0 };
      }
      const entrada = parseDate(item.dataEntrada);
      const conversao = parseDate(item.dataConversao);
      const diasConversao = Math.ceil(
        (conversao.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...item, diasConversao };
    });

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).json(dataWithDias);
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

function parseDate(dateString: string): Date {
  // Espera formato DD/MM/YYYY ou DD/MM/YYYY HH:mm:ss
  const parts = dateString.split(' ');
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
