import { VercelRequest, VercelResponse } from '@vercel/node';

const WINDSOR_API_KEY = '7ad6ed416821918c34af83307733684ba89b';
const WINDSOR_BASE_URL = 'https://connectors.windsor.ai';
const CONNECTOR = 'facebook';

export interface WindsorData {
  date: string;
  impressions: number;
  clicks: number;
  link_clicks: number;
  landing_page_views: number;
  leads: number;
  spend: number;
  cpm: number;
  cpc: number;
  ctr: number;
  campaign_name: string;
  adset_name: string;
  ad_name: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extrair datas da query
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Datas obrigatórias',
        message: 'Forneça start_date e end_date (YYYY-MM-DD)',
      });
    }

    // Construir URL da API Windsor
    const fields = [
      'date',
      'impressions',
      'clicks',
      'link_clicks',
      'spend',
      'cpm',
      'cpc',
      'ctr',
      'campaign_name',
      'adset_name',
      'ad_name',
      'actions',
    ].join(',');

    const windsorUrl = `${WINDSOR_BASE_URL}/${CONNECTOR}?api_key=${WINDSOR_API_KEY}&fields=${fields}&date_from=${start_date}&date_to=${end_date}`;

    // Chamar API Windsor
    const response = await fetch(windsorUrl);
    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(500).json({
        error: 'Erro ao buscar dados do Windsor',
        message: data.error || 'Erro desconhecido',
      });
    }

    // Processar dados
    const records: WindsorData[] = (data.data || [])
      .filter((row: any) => row.date) // Descartar linhas sem data
      .map((row: any) => {
        // Extrair métricas do array actions
        let landing_page_views = 0;
        let leads = 0;

        if (Array.isArray(row.actions)) {
          row.actions.forEach((action: any) => {
            if (action.action_type === 'landing_page_view') {
              landing_page_views = parseFloat(action.value) || 0;
            }
            if (action.action_type === 'lead') {
              leads = parseFloat(action.value) || 0;
            }
          });
        }

        return {
          date: row.date?.trim() || '',
          impressions: parseFloat(row.impressions) || 0,
          clicks: parseFloat(row.clicks) || 0,
          link_clicks: parseFloat(row.link_clicks) || 0,
          landing_page_views,
          leads,
          spend: parseFloat(row.spend) || 0,
          cpm: parseFloat(row.cpm) || 0,
          cpc: parseFloat(row.cpc) || 0,
          ctr: parseFloat(row.ctr) || 0,
          campaign_name: row.campaign_name?.trim() || '',
          adset_name: row.adset_name?.trim() || '',
          ad_name: row.ad_name?.trim() || '',
        };
      });

    // Cache de 1 hora (1h)
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json(records);
  } catch (error) {
    console.error('Erro ao buscar dados do Windsor:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
