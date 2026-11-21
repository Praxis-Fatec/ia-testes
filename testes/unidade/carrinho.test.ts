import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  adicionarAoCarrinho,
  calcularSubtotal,
  carrinhoVazio,
  QUANTIDADE_MAXIMA,
  removerDoCarrinho,
} from "../../src/dominio/carrinho.ts";
import type { Produto } from "../../src/dominio/produto.ts";

const teclado: Produto = { id: 1, nome: "Teclado mecânico", preco: 59.9 };
const mouse: Produto = { id: 2, nome: "Mouse sem fio", preco: 39.9 };

function comUmTeclado() {
  const insercao = adicionarAoCarrinho(carrinhoVazio(), teclado, 1);
  assert.ok(insercao.ok);
  return insercao.carrinho;
}

describe("RN-03: a quantidade é um inteiro maior que zero", () => {
  test("C09 — quantidade 0 é recusada", () => {
    const insercao = adicionarAoCarrinho(carrinhoVazio(), teclado, 0);

    assert.equal(insercao.ok, false);
    assert.ok(!insercao.ok && insercao.erro.includes("maior que zero"));
  });

  test("C10 — quantidade negativa é recusada", () => {
    const insercao = adicionarAoCarrinho(carrinhoVazio(), teclado, -1);

    assert.equal(insercao.ok, false);
    assert.ok(!insercao.ok && insercao.erro.includes("maior que zero"));
  });

  test("C11 — quantidade fracionada é recusada", () => {
    const insercao = adicionarAoCarrinho(carrinhoVazio(), teclado, 1.5);

    assert.equal(insercao.ok, false);
    assert.ok(!insercao.ok && insercao.erro.includes("inteiro"));
  });

  test("C12 — quantidade acima do máximo é recusada", () => {
    const insercao = adicionarAoCarrinho(carrinhoVazio(), teclado, QUANTIDADE_MAXIMA + 1);

    assert.equal(insercao.ok, false);
  });

  test("a quantidade máxima é aceita", () => {
    const insercao = adicionarAoCarrinho(carrinhoVazio(), teclado, QUANTIDADE_MAXIMA);

    assert.ok(insercao.ok);
    assert.equal(insercao.carrinho.itens[0]?.quantidade, QUANTIDADE_MAXIMA);
  });

  test("somar quantidades não pode ultrapassar o máximo", () => {
    const primeira = adicionarAoCarrinho(carrinhoVazio(), teclado, QUANTIDADE_MAXIMA);
    assert.ok(primeira.ok);

    const segunda = adicionarAoCarrinho(primeira.carrinho, teclado, 1);
    assert.equal(segunda.ok, false);
  });

  test("uma quantidade recusada não altera o carrinho", () => {
    const carrinho = comUmTeclado();
    const insercao = adicionarAoCarrinho(carrinho, mouse, 0);

    assert.equal(insercao.ok, false);
    assert.equal(carrinho.itens.length, 1);
  });
});

describe("o carrinho acumula e soma", () => {
  test("C22 — o mesmo produto duas vezes vira um item com as quantidades somadas", () => {
    const primeira = adicionarAoCarrinho(carrinhoVazio(), teclado, 2);
    assert.ok(primeira.ok);

    const segunda = adicionarAoCarrinho(primeira.carrinho, teclado, 3);
    assert.ok(segunda.ok);

    assert.equal(segunda.carrinho.itens.length, 1);
    assert.equal(segunda.carrinho.itens[0]?.quantidade, 5);
  });

  test("C23 — produtos diferentes viram dois itens e somam no subtotal", () => {
    const primeira = adicionarAoCarrinho(carrinhoVazio(), teclado, 1);
    assert.ok(primeira.ok);

    const segunda = adicionarAoCarrinho(primeira.carrinho, mouse, 1);
    assert.ok(segunda.ok);

    assert.equal(segunda.carrinho.itens.length, 2);
    assert.equal(calcularSubtotal(segunda.carrinho.itens), 99.8);
  });

  test("C24 — remover um item recalcula o subtotal", () => {
    const primeira = adicionarAoCarrinho(carrinhoVazio(), teclado, 1);
    assert.ok(primeira.ok);

    const segunda = adicionarAoCarrinho(primeira.carrinho, mouse, 1);
    assert.ok(segunda.ok);

    const depois = removerDoCarrinho(segunda.carrinho, mouse.id);

    assert.equal(depois.itens.length, 1);
    assert.equal(calcularSubtotal(depois.itens), 59.9);
  });

  test("remover um produto que não está no carrinho não muda nada", () => {
    const carrinho = comUmTeclado();
    const depois = removerDoCarrinho(carrinho, 999);

    assert.equal(depois.itens.length, 1);
  });

  test("o subtotal de um carrinho vazio é zero", () => {
    assert.equal(calcularSubtotal([]), 0);
  });
});
