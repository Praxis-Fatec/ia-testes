import type { Carrinho, ResumoCompra } from "../dominio/carrinho.ts";
import {
  PERCENTUAL_DE_DESCONTO,
  SUBTOTAL_MINIMO_PARA_DESCONTO,
} from "../dominio/carrinho.ts";
import { formatarReal } from "../dominio/dinheiro.ts";
import type { Catalogo } from "../dominio/catalogo.ts";

const LARGURA = 48;
const TRACOS = "-".repeat(LARGURA);

export const MENU = [
  "",
  "=== LOJA — LAB V ===",
  "1) Listar produtos",
  "2) Adicionar produto",
  "3) Editar produto",
  "4) Excluir produto",
  "5) Adicionar ao carrinho",
  "6) Ver carrinho",
  "7) Comprar",
  "0) Sair",
].join("\n");

export function alinhar(esquerda: string, direita: string): string {
  const espacos = Math.max(1, LARGURA - esquerda.length - direita.length);
  return esquerda + " ".repeat(espacos) + direita;
}

export function listarCatalogo(catalogo: Catalogo): string {
  if (catalogo.produtos.length === 0) {
    return "Nenhum produto cadastrado.";
  }

  const linhas = catalogo.produtos.map((produto) =>
    alinhar(`  [${produto.id}] ${produto.nome}`, formatarReal(produto.preco)),
  );
  return ["", "PRODUTOS", TRACOS, ...linhas].join("\n");
}

export function listarCarrinho(carrinho: Carrinho): string {
  if (carrinho.itens.length === 0) {
    return "O carrinho está vazio.";
  }

  const linhas = carrinho.itens.map((item) =>
    alinhar(
      `  ${item.quantidade} x ${item.produto.nome}`,
      formatarReal(item.produto.preco * item.quantidade),
    ),
  );
  return ["", "CARRINHO", TRACOS, ...linhas].join("\n");
}

export function resumirNaTela(carrinho: Carrinho, resumo: ResumoCompra): string {
  const percentual = `${PERCENTUAL_DE_DESCONTO * 100}%`;
  const minimo = formatarReal(SUBTOTAL_MINIMO_PARA_DESCONTO);

  const partes = [
    "",
    "RESUMO DA COMPRA",
    TRACOS,
    ...carrinho.itens.map((item) =>
      alinhar(
        `  ${item.quantidade} x ${item.produto.nome}`,
        formatarReal(item.produto.preco * item.quantidade),
      ),
    ),
    TRACOS,
    alinhar("  Subtotal", formatarReal(resumo.subtotal)),
    alinhar(`  Desconto (${percentual})`, `-${formatarReal(resumo.desconto)}`),
    TRACOS,
    alinhar("  TOTAL", formatarReal(resumo.total)),
    "",
  ];

  if (resumo.descontoAplicado) {
    partes.push(`Desconto de ${percentual} aplicado: o subtotal atingiu ${minimo}.`);
  } else {
    partes.push(
      `Faltam ${formatarReal(resumo.faltaParaDesconto)} para o desconto de ${percentual}.`,
    );
  }

  return partes.join("\n");
}
