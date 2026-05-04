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
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  ad_id: string;
  followers: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extrair datas e filtro da query
    const { start_date, end_date, filter } = req.query;
    const campaignFilter = (filter as string) || 'PPTOMentoria';

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
      'campaign_name',
      'adset_name',
      'ad_name',
      'ad_id',
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

    // Processar dados - Filtrar por campanha dinâmica
    const records: WindsorData[] = (data.data || [])
      .filter((row: any) => row.date) // Descartar linhas sem data
      .filter((row: any) => row.campaign_name?.includes(campaignFilter)) // Filtrar por campaign_name
      .map((row: any) => {
        // Extrair métricas do array actions
        let landing_page_views = 0;
        let leads = 0;
        let followers = 0;

        if (Array.isArray(row.actions)) {
          row.actions.forEach((action: any) => {
            if (action.action_type === 'landing_page_view') {
              landing_page_views = parseFloat(action.value) || 0;
            }
            if (action.action_type === 'lead') {
              leads = parseFloat(action.value) || 0;
            }
            // Capturar seguidores - Meta usa diferentes tipos de action
            if (action.action_type === 'follow' ||
                action.action_type === 'page_fan' ||
                action.action_type === 'instagram_profile_follow') {
              followers = parseFloat(action.value) || 0;
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
          campaign_name: row.campaign_name?.trim() || '',
          adset_name: row.adset_name?.trim() || '',
          ad_name: row.ad_name?.trim() || '',
          ad_id: row.ad_id?.trim() || '',
          followers,
        };
      });

    // Cache de 5 minutos (300s) - dados frescos mais frequentemente
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(records);
  } catch (error) {
    console.error('Erro ao buscar dados do Windsor:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
