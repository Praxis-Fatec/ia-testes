export function arredondarCentavos(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function formatarReal(valor: number): string {
  return arredondarCentavos(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
