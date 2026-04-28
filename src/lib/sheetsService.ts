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

const MOCK_DATA: CruzamentoData[] = [
  {
    email: 'cliente1@example.com',
    utmMedium: 'Instagram',
    utmContent: 'Carousel_1',
    utmCampaign: 'Start90_Jan',
    utmTerm: 'Lead_Gen',
    dataEntrada: '01/01/2025 10:30:00',
    valorVenda: 297.00,
    dataConversao: '15/01/2025 14:45:00',
    diasConversao: 14,
    observacao: 'Conversão rápida',
  },
  {
    email: 'cliente2@example.com',
    utmMedium: 'Facebook',
    utmContent: 'Video_Ad',
    utmCampaign: 'Start90_Feb',
    utmTerm: 'Conversion',
    dataEntrada: '05/01/2025 08:15:00',
    valorVenda: 297.00,
    dataConversao: '28/01/2025 11:20:00',
    diasConversao: 23,
    observacao: 'Conversão após acompanhamento',
  },
  {
    email: 'cliente3@example.com',
    utmMedium: 'Instagram',
    utmContent: 'Stories',
    utmCampaign: 'Start90_Jan',
    utmTerm: 'Traffic',
    dataEntrada: '10/01/2025 16:00:00',
    valorVenda: 297.00,
    dataConversao: '20/01/2025 09:30:00',
    diasConversao: 10,
    observacao: 'Melhor conversion rate',
  },
  {
    email: 'cliente4@example.com',
    utmMedium: 'YouTube',
    utmContent: 'Pre-roll',
    utmCampaign: 'Start90_Feb',
    utmTerm: 'Branding',
    dataEntrada: '12/01/2025 12:45:00',
    valorVenda: 297.00,
    dataConversao: '05/02/2025 13:15:00',
    diasConversao: 24,
    observacao: 'Conversão após brand awareness',
  },
];

export async function fetchSheetData(): Promise<CruzamentoData[]> {
  try {
    const response = await fetch('/api/sheets');
    if (!response.ok) {
      throw new Error('API indisponível, usando dados mock');
    }
    return await response.json();
  } catch (error) {
    console.log('Usando dados mock para demonstração');
    return MOCK_DATA;
  }
}
