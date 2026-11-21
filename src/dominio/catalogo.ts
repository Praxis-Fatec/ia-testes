import { arredondarCentavos } from "./dinheiro.ts";
import { type Produto, type Validacao, validarProduto } from "./produto.ts";

export type Catalogo = {
  produtos: Produto[];
  proximoId: number;
};

export type Alteracao =
  | { ok: true; catalogo: Catalogo; produto: Produto }
  | { ok: false; erro: string };

export type Remocao =
  | { ok: true; catalogo: Catalogo }
  | { ok: false; erro: string };

export function catalogoVazio(): Catalogo {
  return { produtos: [], proximoId: 1 };
}

export function buscarProduto(catalogo: Catalogo, id: number): Produto | undefined {
  return catalogo.produtos.find((produto) => produto.id === id);
}

export function adicionarProduto(
  catalogo: Catalogo,
  nome: string,
  preco: number,
): Alteracao {
  const validacao = validarProduto(nome, preco);
  if (!validacao.valido) {
    return { ok: false, erro: validacao.erro };
  }

  const produto: Produto = {
    id: catalogo.proximoId,
    nome: nome.trim(),
    preco: arredondarCentavos(preco),
  };

  return {
    ok: true,
    produto,
    catalogo: {
      produtos: [...catalogo.produtos, produto],
      proximoId: catalogo.proximoId + 1,
    },
  };
}

export function editarProduto(
  catalogo: Catalogo,
  id: number,
  nome: string,
  preco: number,
): Alteracao {
  if (buscarProduto(catalogo, id) === undefined) {
    return { ok: false, erro: naoEncontrado(id) };
  }

  const validacao = validarProduto(nome, preco);
  if (!validacao.valido) {
    return { ok: false, erro: validacao.erro };
  }

  const produto: Produto = { id, nome: nome.trim(), preco: arredondarCentavos(preco) };

  return {
    ok: true,
    produto,
    catalogo: {
      produtos: catalogo.produtos.map((atual) => (atual.id === id ? produto : atual)),
      proximoId: catalogo.proximoId,
    },
  };
}

export function excluirProduto(catalogo: Catalogo, id: number): Remocao {
  if (buscarProduto(catalogo, id) === undefined) {
    return { ok: false, erro: naoEncontrado(id) };
  }

  return {
    ok: true,
    catalogo: {
      produtos: catalogo.produtos.filter((produto) => produto.id !== id),
      proximoId: catalogo.proximoId,
    },
  };
}

function naoEncontrado(id: number): string {
  return `Não existe produto com o código ${id}.`;
}

export type { Produto, Validacao };
