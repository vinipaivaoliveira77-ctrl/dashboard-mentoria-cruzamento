export interface HotmartMetrics {
  totalVendas: number;
  totalFaturamento: number;
  ticketMedio: number;
}

export async function fetchHotmartData(startDate?: string, endDate?: string): Promise<HotmartMetrics> {
  try {
    let url = '/api/hotmart';
    const params = new URLSearchParams();

    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const now = new Date();
    const today = now.toLocaleDateString('pt-BR');
    const refreshKey = `hotmart_daily_refresh_${today}`;

    if (now.getHours() >= 10 && !sessionStorage.getItem(refreshKey)) {
      url += (params.toString() ? '&' : '?') + `bust=${Date.now()}`;
      sessionStorage.setItem(refreshKey, 'true');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro ao buscar dados do Hotmart:', response.status, response.statusText);
      return {
        totalVendas: 0,
        totalFaturamento: 0,
        ticketMedio: 0,
      };
    }

    const data = await response.json();
    return data || {
      totalVendas: 0,
      totalFaturamento: 0,
      ticketMedio: 0,
    };
  } catch (error) {
    console.error('Erro ao conectar com Hotmart:', error);
    return {
      totalVendas: 0,
      totalFaturamento: 0,
      ticketMedio: 0,
    };
  }
}
