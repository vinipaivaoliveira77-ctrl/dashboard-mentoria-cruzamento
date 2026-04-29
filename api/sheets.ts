import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1g-M-7UqI4DufsoXfkyjOkQiSXQOSW2p0A-IfeStKNTs';
const SHEET_NAME = 'Cruzamento de Dados - Mentoria';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
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
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL || '',
      } as any,
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

    // Mapear colunas por índice fixo
    // A=0(EMAIL), B=1(UTM MEDIUM), C=2(UTM CONTENT), D=3(UTM CAMPAIGN),
    // E=4(UTM TERM), F=5(DATA ENTRADA), G=6(VALOR VENDA), H=7(DATA CONVERSAO),
    // I=8(DIAS), J=9(OBSERVACAO)

    const data = rows.slice(1).map((row) => {
      const email = row[0]?.trim() || '';
      const utmMedium = row[1]?.trim() || '';
      const utmContent = row[2]?.trim() || '';
      const utmCampaign = row[3]?.trim() || '';
      const utmTerm = row[4]?.trim() || '';
      const dataEntrada = row[5]?.trim() || '';

      // Converter valor com format brasileiro (R$ 1.987,00 → 1987.00)
      const valorStr = row[6]?.toString().trim() || '0';
      const valorLimpo = valorStr
        .replace(/R\$\s?/g, '') // Remove "R$"
        .replace(/\./g, '') // Remove separador de milhares
        .replace(',', '.') // Converte vírgula em ponto
        .trim();
      const valorVenda = parseFloat(valorLimpo) || 0;

      const dataConversao = row[7]?.trim() || '';

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

    res.setHeader('Cache-Control', 'public, max-age=300');
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
  const month = parseInt(dateParts[1], 10) - 1;
  const year = parseInt(dateParts[2], 10);
  const hour = parseInt(timeParts[0], 10) || 0;
  const minute = parseInt(timeParts[1], 10) || 0;
  const second = parseInt(timeParts[2], 10) || 0;

  return new Date(year, month, day, hour, minute, second);
}
