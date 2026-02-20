export function formatarDataRelativa(dataString: string): string {
  const data = new Date(dataString);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  if (diffDias < 30) return `${Math.floor(diffDias / 7)} semanas atrás`;
  if (diffDias < 365) return `${Math.floor(diffDias / 30)} meses atrás`;
  return data.toLocaleDateString('pt-BR');
}

export function formatarData(dataStr: string): string {
  const match = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const ano = parseInt(match[1]);
    const mes = parseInt(match[2]) - 1;
    const dia = parseInt(match[3]);
    const data = new Date(ano, mes, dia);
    return data.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatarHora(dataStr: string): string {
  const match = dataStr.match(/T(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  const data = new Date(dataStr);
  const horas = data.getUTCHours().toString().padStart(2, '0');
  const minutos = data.getUTCMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

export function formatarHorario(inicio: string, fim: string | null): string {
  const horaInicio = formatarHora(inicio);

  const matchInicio = inicio.match(/T(\d{2}):(\d{2})/);
  const horaInicioNum = matchInicio ? parseInt(matchInicio[1]) : 0;
  const minutoInicioNum = matchInicio ? parseInt(matchInicio[2]) : 0;

  if (fim) {
    const horaFim = formatarHora(fim);
    if (horaInicio === horaFim || (horaInicio === '01:23' && horaFim === '01:23')) {
      return 'Dia inteiro';
    }
    return `${horaInicio} às ${horaFim}`;
  }

  if (horaInicioNum === 1 && minutoInicioNum === 23) {
    return 'Dia inteiro';
  }

  return horaInicio;
}

export function formatarPeriodo(inicio: string, fim: string | null): string {
  const extrairPartes = (dataStr: string) => {
    const match = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return { ano: parseInt(match[1]), mes: parseInt(match[2]) - 1, dia: parseInt(match[3]) };
    }
    const d = new Date(dataStr);
    return { ano: d.getFullYear(), mes: d.getMonth(), dia: d.getDate() };
  };

  const inicioPartes = extrairPartes(inicio);
  const fimPartes = fim ? extrairPartes(fim) : null;

  if (!fimPartes || (inicioPartes.dia === fimPartes.dia && inicioPartes.mes === fimPartes.mes && inicioPartes.ano === fimPartes.ano)) {
    return formatarData(inicio);
  }

  if (inicioPartes.mes !== fimPartes.mes || inicioPartes.ano !== fimPartes.ano) {
    return `${formatarData(inicio)} até ${formatarData(fim!)}`;
  }

  const dataRef = new Date(inicioPartes.ano, inicioPartes.mes, inicioPartes.dia);
  return `${inicioPartes.dia} a ${fimPartes.dia} de ${dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
}
