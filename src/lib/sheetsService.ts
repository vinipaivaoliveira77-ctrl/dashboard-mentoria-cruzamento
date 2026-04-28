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
    utmCampaign: 'Mentoria_Apr',
    utmTerm: 'Lead_Gen',
    dataEntrada: '20/04/2026 10:30:00',
    valorVenda: 297.00,
    dataConversao: '22/04/2026 14:45:00',
    diasConversao: 2,
    observacao: 'Conversão rápida',
  },
  {
    email: 'cliente2@example.com',
    utmMedium: 'Facebook',
    utmContent: 'Video_Ad',
    utmCampaign: 'Mentoria_Apr',
    utmTerm: 'Conversion',
    dataEntrada: '21/04/2026 08:15:00',
    valorVenda: 497.00,
    dataConversao: '23/04/2026 11:20:00',
    diasConversao: 2,
    observacao: 'Conversão após acompanhamento',
  },
  {
    email: 'cliente3@example.com',
    utmMedium: 'Instagram',
    utmContent: 'Stories',
    utmCampaign: 'Mentoria_Apr',
    utmTerm: 'Traffic',
    dataEntrada: '22/04/2026 16:00:00',
    valorVenda: 397.00,
    dataConversao: '24/04/2026 09:30:00',
    diasConversao: 2,
    observacao: 'Melhor conversion rate',
  },
  {
    email: 'cliente4@example.com',
    utmMedium: 'YouTube',
    utmContent: 'Pre-roll',
    utmCampaign: 'Mentoria_Apr',
    utmTerm: 'Branding',
    dataEntrada: '23/04/2026 12:45:00',
    valorVenda: 597.00,
    dataConversao: '25/04/2026 13:15:00',
    diasConversao: 2,
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
