import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  calcularDesconto,
  calcularSubtotal,
  resumirCompra,
  SUBTOTAL_MINIMO_PARA_DESCONTO,
} from "../../src/dominio/carrinho.ts";
import type { Produto } from "../../src/dominio/produto.ts";

function produto(preco: number, id = 1): Produto {
  return { id, nome: `Produto ${id}`, preco };
}

describe("RN-01: subtotal de R$ 100,00 ou mais recebe 10% de desconto", () => {
  test("C01 — subtotal de R$ 99,98 não recebe desconto", () => {
    assert.equal(calcularDesconto(99.98), 0);
  });

  test("C02 — subtotal de R$ 99,99 não recebe desconto", () => {
    assert.equal(calcularDesconto(99.99), 0);
  });

  test("C03 — subtotal de R$ 100,00 recebe R$ 10,00 de desconto", () => {
    assert.equal(calcularDesconto(100), 10);
  });

  test("C04 — subtotal de R$ 100,01 recebe R$ 10,00, não R$ 10,001", () => {
    assert.equal(calcularDesconto(100.01), 10);
  });

  test("o limite declarado é R$ 100,00", () => {
    assert.equal(SUBTOTAL_MINIMO_PARA_DESCONTO, 100);
  });
});

describe("o limite pode ser atravessado pela multiplicação", () => {
  test("C05 — 3 x R$ 33,33 soma R$ 99,99 e não recebe desconto", () => {
    const itens = [{ produto: produto(33.33), quantidade: 3 }];
    assert.equal(calcularSubtotal(itens), 99.99);
    assert.equal(calcularDesconto(calcularSubtotal(itens)), 0);
  });

  test("C06 — 3 x R$ 33,34 soma R$ 100,02 e recebe desconto", () => {
    const itens = [{ produto: produto(33.34), quantidade: 3 }];
    assert.equal(calcularSubtotal(itens), 100.02);
    assert.equal(calcularDesconto(calcularSubtotal(itens)), 10);
  });
});

describe("o desconto é arredondado em centavos", () => {
  test("C07 — 10% de R$ 100,05 é R$ 10,01", () => {
    assert.equal(calcularDesconto(100.05), 10.01);
  });

  test("C08 — 10% de R$ 129,90 é R$ 12,99", () => {
    assert.equal(calcularDesconto(129.9), 12.99);
  });
});

describe("o resumo da compra", () => {
  test("abaixo do limite informa quanto falta", () => {
    const resumo = resumirCompra({ itens: [{ produto: produto(99.99), quantidade: 1 }] });

    assert.equal(resumo.subtotal, 99.99);
    assert.equal(resumo.desconto, 0);
    assert.equal(resumo.total, 99.99);
    assert.equal(resumo.descontoAplicado, false);
    assert.equal(resumo.faltaParaDesconto, 0.01);
  });

  test("no limite exato aplica o desconto e nada falta", () => {
    const resumo = resumirCompra({ itens: [{ produto: produto(100), quantidade: 1 }] });

    assert.equal(resumo.subtotal, 100);
    assert.equal(resumo.desconto, 10);
    assert.equal(resumo.total, 90);
    assert.equal(resumo.descontoAplicado, true);
    assert.equal(resumo.faltaParaDesconto, 0);
  });

  test("o total é sempre o subtotal menos o desconto", () => {
    for (const preco of [10, 49.9, 99.99, 100, 100.01, 129.9, 999.99]) {
      const resumo = resumirCompra({ itens: [{ produto: produto(preco), quantidade: 1 }] });
      assert.equal(resumo.total, Math.round((resumo.subtotal - resumo.desconto) * 100) / 100);
    }
  });

  test("carrinho vazio tem subtotal zero e nenhum desconto", () => {
    const resumo = resumirCompra({ itens: [] });

    assert.equal(resumo.subtotal, 0);
    assert.equal(resumo.desconto, 0);
    assert.equal(resumo.total, 0);
    assert.equal(resumo.descontoAplicado, false);
  });
});
