import { arredondarCentavos } from "./dinheiro.ts";
import type { Produto } from "./produto.ts";

export const SUBTOTAL_MINIMO_PARA_DESCONTO = 100;
export const PERCENTUAL_DE_DESCONTO = 0.1;
export const QUANTIDADE_MAXIMA = 999;

export type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

export type Carrinho = {
  itens: ItemCarrinho[];
};

export type Insercao =
  | { ok: true; carrinho: Carrinho }
  | { ok: false; erro: string };

export type ResumoCompra = {
  subtotal: number;
  desconto: number;
  total: number;
  descontoAplicado: boolean;
  faltaParaDesconto: number;
};

export function carrinhoVazio(): Carrinho {
  return { itens: [] };
}

export function adicionarAoCarrinho(
  carrinho: Carrinho,
  produto: Produto,
  quantidade: number,
): Insercao {
  if (!Number.isInteger(quantidade)) {
    return { ok: false, erro: "A quantidade deve ser um número inteiro." };
  }
  if (quantidade <= 0) {
    return { ok: false, erro: "A quantidade deve ser maior que zero." };
  }
  if (quantidade > QUANTIDADE_MAXIMA) {
    return { ok: false, erro: `A quantidade deve ser de no máximo ${QUANTIDADE_MAXIMA}.` };
  }

  const jaNoCarrinho = carrinho.itens.find((item) => item.produto.id === produto.id);
  if (jaNoCarrinho === undefined) {
    return { ok: true, carrinho: { itens: [...carrinho.itens, { produto, quantidade }] } };
  }

  const somada = jaNoCarrinho.quantidade + quantidade;
  if (somada > QUANTIDADE_MAXIMA) {
    return { ok: false, erro: `A quantidade deve ser de no máximo ${QUANTIDADE_MAXIMA}.` };
  }

  return {
    ok: true,
    carrinho: {
      itens: carrinho.itens.map((item) =>
        item.produto.id === produto.id ? { produto, quantidade: somada } : item,
      ),
    },
  };
}

export function removerDoCarrinho(carrinho: Carrinho, idDoProduto: number): Carrinho {
  return { itens: carrinho.itens.filter((item) => item.produto.id !== idDoProduto) };
}

export function calcularSubtotal(itens: ItemCarrinho[]): number {
  const soma = itens.reduce(
    (acumulado, item) => acumulado + item.produto.preco * item.quantidade,
    0,
  );
  return arredondarCentavos(soma);
}

export function calcularDesconto(subtotal: number): number {
  if (subtotal < SUBTOTAL_MINIMO_PARA_DESCONTO) {
    return 0;
  }
  return arredondarCentavos(subtotal * PERCENTUAL_DE_DESCONTO);
}

export function resumirCompra(carrinho: Carrinho): ResumoCompra {
  const subtotal = calcularSubtotal(carrinho.itens);
  const desconto = calcularDesconto(subtotal);

  return {
    subtotal,
    desconto,
    total: arredondarCentavos(subtotal - desconto),
    descontoAplicado: desconto > 0,
    faltaParaDesconto:
      subtotal >= SUBTOTAL_MINIMO_PARA_DESCONTO
        ? 0
        : arredondarCentavos(SUBTOTAL_MINIMO_PARA_DESCONTO - subtotal),
  };
}
