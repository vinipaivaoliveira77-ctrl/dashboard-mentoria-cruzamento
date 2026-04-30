import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1g-M-7UqI4DufsoXfkyjOkQiSXQOSW2p0A-IfeStKNTs';
const SHEET_NAME = 'Vendas da Hotmart';

export interface HotmartMetrics {
  totalVendas: number;
  totalFaturamento: number;
  ticketMedio: number;
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

  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const year = parseInt(dateParts[2], 10);

  return new Date(year, month, day);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { start_date, end_date } = req.query;
    
    if (
      !process.env.GOOGLE_PROJECT_ID ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_CLIENT_EMAIL
    ) {
      return res.status(500).json({
        error: 'Credenciais do Google nao configuradas',
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
      return res.status(200).json({
        totalVendas: 0,
        totalFaturamento: 0,
        ticketMedio: 0,
      });
    }

    let totalVendas = 0;
    let totalFaturamento = 0;

    const vendas = rows.slice(1).map((row) => {
      const nomeProduto = row[1]?.trim() || '';
      const dataCompraStr = row[6]?.trim() || '';
      const precoStr = row[4]?.toString().trim() || '0';

      const precoLimpo = precoStr
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();
      const preco = parseFloat(precoLimpo) || 0;

      return {
        nomeProduto,
        dataCompra: dataCompraStr,
        preco,
      };
    });

    const startDateObj = start_date ? new Date(start_date as string + 'T00:00:00') : null;
    const endDateObj = end_date ? new Date(end_date as string + 'T23:59:59') : null;

    const vendasMentoria = vendas.filter(v => {
      const temMentoria = v.nomeProduto.includes('Mentoria Start 90');
      if (!temMentoria) return false;

      if (!startDateObj || !endDateObj) return true;

      const dataVenda = parseDate(v.dataCompra);
      return dataVenda >= startDateObj && dataVenda <= endDateObj;
    });

    totalVendas = vendasMentoria.length;
    totalFaturamento = vendasMentoria.reduce((sum, v) => sum + v.preco, 0);
    const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json({
      totalVendas,
      totalFaturamento,
      ticketMedio,
      _debug: {
        start_date: start_date,
        end_date: end_date,
        startDateObj: startDateObj?.toISOString(),
        endDateObj: endDateObj?.toISOString(),
        totalRows: rows.length - 1,
        mentoriaRows: vendas.filter(v => v.nomeProduto.includes('Mentoria Start 90')).length,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do Hotmart:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
