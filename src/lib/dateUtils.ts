export function parseDate(dateString: string): Date {
  // Espera formato DD/MM/YYYY HH:mm:ss
  const parts = dateString.split(' ');
  const dateParts = parts[0].split('/');
  const timeParts = parts[1]?.split(':') || [0, 0, 0];

  return new Date(
    parseInt(dateParts[2]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[0]),
    parseInt(timeParts[0]),
    parseInt(timeParts[1]),
    parseInt(timeParts[2])
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}
