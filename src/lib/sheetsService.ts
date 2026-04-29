export interface CruzamentoData {
  email: string;
  nome?: string;
  utmMedium: string;
  utmContent: string;
  utmCampaign: string;
  utmTerm: string;
  utmSource?: string;
  telefone?: string;
  dataEntrada: string;
  valorVenda: number;
  dataConversao: string;
  diasConversao: number;
}

export async function fetchSheetData(): Promise<CruzamentoData[]> {
  try {
    const now = new Date();
    const today = now.toLocaleDateString('pt-BR');
    const refreshKey = `sheets_daily_refresh_${today}`;

    // Após 10h, primeiro acesso do dia ignora cache
    let url = '/api/sheets';
    if (now.getHours() >= 10 && !sessionStorage.getItem(refreshKey)) {
      url += `?bust=${Date.now()}`;
      sessionStorage.setItem(refreshKey, 'true');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro ao buscar dados:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Erro ao conectar com Google Sheets:', error);
    return [];
  }
}
