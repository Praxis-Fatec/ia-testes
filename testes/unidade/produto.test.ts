import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { validarNome, validarPreco, validarProduto } from "../../src/dominio/produto.ts";

describe("RN-02: o preço é maior que zero e tem até duas casas decimais", () => {
  test("C13 — preço zero é recusado", () => {
    const validacao = validarPreco(0);

    assert.equal(validacao.valido, false);
    assert.ok(!validacao.valido && validacao.erro.includes("maior que zero"));
  });

  test("C14 — preço negativo é recusado", () => {
    assert.equal(validarPreco(-10).valido, false);
  });

  test("C15 — preço com três casas decimais é recusado", () => {
    const validacao = validarPreco(10.555);

    assert.equal(validacao.valido, false);
    assert.ok(!validacao.valido && validacao.erro.includes("duas casas"));
  });

  test("C16 — preço não numérico é recusado", () => {
    const validacao = validarPreco(Number("abc"));

    assert.equal(validacao.valido, false);
    assert.ok(!validacao.valido && validacao.erro.includes("número"));
  });

  test("o menor preço possível é um centavo", () => {
    assert.equal(validarPreco(0.01).valido, true);
  });

  test("preços comuns com duas casas são aceitos", () => {
    for (const preco of [0.01, 1, 59.9, 59.99, 129.9, 1000]) {
      assert.equal(validarPreco(preco).valido, true, `recusou ${preco}`);
    }
  });

  test("preço acima do máximo é recusado", () => {
    assert.equal(validarPreco(1_000_001).valido, false);
  });

  test("infinito é recusado", () => {
    assert.equal(validarPreco(Number.POSITIVE_INFINITY).valido, false);
  });
});

describe("RN-02: o nome é obrigatório", () => {
  test("C17 — nome vazio é recusado", () => {
    const validacao = validarNome("");

    assert.equal(validacao.valido, false);
    assert.ok(!validacao.valido && validacao.erro.includes("obrigatório"));
  });

  test("C18 — nome só com espaços é recusado", () => {
    assert.equal(validarNome("     ").valido, false);
  });

  test("C19 — nome com 61 caracteres é recusado", () => {
    assert.equal(validarNome("a".repeat(61)).valido, false);
  });

  test("nome com 60 caracteres é aceito", () => {
    assert.equal(validarNome("a".repeat(60)).valido, true);
  });
});

describe("a validação do produto cobre nome e preço", () => {
  test("recusa pelo nome antes de olhar o preço", () => {
    const validacao = validarProduto("", -5);

    assert.equal(validacao.valido, false);
    assert.ok(!validacao.valido && validacao.erro.includes("obrigatório"));
  });

  test("aceita um produto válido", () => {
    assert.equal(validarProduto("Teclado mecânico", 59.9).valido, true);
  });
});
