export interface CruzamentoData {
  email: string;
  utmMedium: string;
  utmContent: string;
  utmCampaign: string;
  utmTerm: string;
  dataEntrada: string;
  valorVenda: number;
  dataConversao: string;
  diasConversao: number;
  observacao: string;
}

export async function fetchSheetData(): Promise<CruzamentoData[]> {
  try {
    const response = await fetch('/api/sheets');
    if (!response.ok) {
      throw new Error('Erro ao buscar dados');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error);
    return [];
  }
}
