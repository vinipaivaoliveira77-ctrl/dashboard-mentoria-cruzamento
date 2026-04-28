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
    const response = await fetch('/api/sheets', {
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
