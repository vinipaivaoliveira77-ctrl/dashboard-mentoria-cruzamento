export interface WindsorMetrics {
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

export async function fetchWindsorData(
  startDate: string,
  endDate: string
): Promise<WindsorMetrics[]> {
  try {
    const response = await fetch(
      `/api/windsor?start_date=${startDate}&end_date=${endDate}`
    );

    if (!response.ok) {
      console.error('Erro ao buscar Windsor:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data as WindsorMetrics[];
  } catch (error) {
    console.error('Erro ao buscar dados do Windsor:', error);
    return [];
  }
}

// Função para calcular Connect Rate
export const calculateConnectRate = (
  landing_page_views: number,
  link_clicks: number
): number => {
  if (link_clicks === 0) return 0;
  return (landing_page_views / link_clicks) * 100;
};

// Função para calcular Page Conversion Rate
export const calculatePageConversionRate = (
  leads: number,
  landing_page_views: number
): number => {
  if (landing_page_views === 0) return 0;
  return (leads / landing_page_views) * 100;
};

// Função para calcular CPL (Custo por Lead)
export const calculateCPL = (spend: number, leads: number): number => {
  if (leads === 0) return 0;
  return spend / leads;
};
