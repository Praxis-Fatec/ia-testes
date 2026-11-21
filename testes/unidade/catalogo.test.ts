import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  adicionarProduto,
  buscarProduto,
  catalogoVazio,
  editarProduto,
  excluirProduto,
  type Catalogo,
} from "../../src/dominio/catalogo.ts";

function comUmTeclado(): Catalogo {
  const alteracao = adicionarProduto(catalogoVazio(), "Teclado mecânico", 59.9);
  assert.ok(alteracao.ok);
  return alteracao.catalogo;
}

describe("cadastrar produto", () => {
  test("um produto cadastrado recebe código e entra na lista", () => {
    const alteracao = adicionarProduto(catalogoVazio(), "Teclado mecânico", 59.9);

    assert.ok(alteracao.ok);
    assert.equal(alteracao.produto.id, 1);
    assert.equal(alteracao.catalogo.produtos.length, 1);
  });

  test("o código do próximo produto não se repete", () => {
    const primeiro = adicionarProduto(catalogoVazio(), "Teclado", 59.9);
    assert.ok(primeiro.ok);

    const segundo = adicionarProduto(primeiro.catalogo, "Mouse", 39.9);
    assert.ok(segundo.ok);

    assert.equal(segundo.produto.id, 2);
  });

  test("o nome é gravado sem espaços nas pontas", () => {
    const alteracao = adicionarProduto(catalogoVazio(), "  Teclado  ", 59.9);

    assert.ok(alteracao.ok);
    assert.equal(alteracao.produto.nome, "Teclado");
  });

  test("um produto inválido não entra no catálogo", () => {
    const catalogo = catalogoVazio();
    const alteracao = adicionarProduto(catalogo, "", 59.9);

    assert.equal(alteracao.ok, false);
    assert.equal(catalogo.produtos.length, 0);
  });
});

describe("editar produto", () => {
  test("o nome e o preço mudam e o código continua o mesmo", () => {
    const alteracao = editarProduto(comUmTeclado(), 1, "Teclado ABNT2", 79.9);

    assert.ok(alteracao.ok);
    assert.equal(alteracao.produto.id, 1);
    assert.equal(alteracao.produto.nome, "Teclado ABNT2");
    assert.equal(alteracao.produto.preco, 79.9);
  });

  test("C20 — editar um produto inexistente é recusado", () => {
    const alteracao = editarProduto(comUmTeclado(), 999, "Qualquer", 10);

    assert.equal(alteracao.ok, false);
    assert.ok(!alteracao.ok && alteracao.erro.includes("999"));
  });

  test("editar com preço inválido não altera o catálogo", () => {
    const catalogo = comUmTeclado();
    const alteracao = editarProduto(catalogo, 1, "Teclado", -1);

    assert.equal(alteracao.ok, false);
    assert.equal(buscarProduto(catalogo, 1)?.preco, 59.9);
  });
});

describe("excluir produto", () => {
  test("o produto sai da lista", () => {
    const remocao = excluirProduto(comUmTeclado(), 1);

    assert.ok(remocao.ok);
    assert.equal(remocao.catalogo.produtos.length, 0);
  });

  test("C21 — excluir um produto inexistente é recusado", () => {
    const remocao = excluirProduto(comUmTeclado(), 999);

    assert.equal(remocao.ok, false);
    assert.ok(!remocao.ok && remocao.erro.includes("999"));
  });

  test("excluir não reaproveita o código em um cadastro novo", () => {
    const remocao = excluirProduto(comUmTeclado(), 1);
    assert.ok(remocao.ok);

    const alteracao = adicionarProduto(remocao.catalogo, "Mouse", 39.9);
    assert.ok(alteracao.ok);
    assert.equal(alteracao.produto.id, 2);
  });
});
