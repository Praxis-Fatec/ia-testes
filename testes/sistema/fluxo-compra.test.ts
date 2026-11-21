import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";

const PROGRAMA = fileURLToPath(new URL("../../src/index.ts", import.meta.url));

function executarLoja(digitado: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const processo = spawn(process.execPath, [PROGRAMA], { stdio: ["pipe", "pipe", "pipe"] });
    let saida = "";

    processo.stdout.on("data", (pedaco) => (saida += String(pedaco)));
    processo.stderr.on("data", (pedaco) => (saida += String(pedaco)));
    processo.on("error", reject);
    processo.on("close", () => resolve(saida.replaceAll(" ", " ")));

    processo.stdin.end(digitado.join("\n") + "\n");
  });
}

const TECLADO = "1";
const MOUSE = "2";
const LISTAR = "1";
const CADASTRAR = "2";
const AO_CARRINHO = "5";
const VER_CARRINHO = "6";
const COMPRAR = "7";
const SAIR = "0";

describe("fluxo de compra pela linha de comando", () => {
  test("compra abaixo de R$ 100,00 não recebe desconto e informa quanto falta", async () => {
    const saida = await executarLoja([
      AO_CARRINHO, TECLADO, "1",
      AO_CARRINHO, MOUSE, "1",
      COMPRAR,
      SAIR,
    ]);

    assert.match(saida, /Subtotal\s+R\$ 99,80/);
    assert.match(saida, /Desconto \(10%\)\s+-R\$ 0,00/);
    assert.match(saida, /TOTAL\s+R\$ 99,80/);
    assert.match(saida, /Faltam R\$ 0,20 para o desconto de 10%/);
    assert.doesNotMatch(saida, /Desconto de 10% aplicado/);
  });

  test("compra de exatamente R$ 100,00 recebe 10% e fecha em R$ 90,00", async () => {
    const saida = await executarLoja([
      CADASTRAR, "Cadeira gamer", "100.00",
      AO_CARRINHO, "4", "1",
      COMPRAR,
      SAIR,
    ]);

    assert.match(saida, /Subtotal\s+R\$ 100,00/);
    assert.match(saida, /Desconto \(10%\)\s+-R\$ 10,00/);
    assert.match(saida, /TOTAL\s+R\$ 90,00/);
    assert.match(saida, /Desconto de 10% aplicado/);
  });

  test("um centavo abaixo do limite ainda não recebe desconto", async () => {
    const saida = await executarLoja([
      CADASTRAR, "Produto de borda", "99.99",
      AO_CARRINHO, "4", "1",
      COMPRAR,
      SAIR,
    ]);

    assert.match(saida, /Subtotal\s+R\$ 99,99/);
    assert.match(saida, /TOTAL\s+R\$ 99,99/);
    assert.match(saida, /Faltam R\$ 0,01 para o desconto de 10%/);
  });

  test("três unidades de R$ 33,34 cruzam o limite pela multiplicação", async () => {
    const saida = await executarLoja([
      CADASTRAR, "Caneca", "33.34",
      AO_CARRINHO, "4", "3",
      COMPRAR,
      SAIR,
    ]);

    assert.match(saida, /Subtotal\s+R\$ 100,02/);
    assert.match(saida, /Desconto \(10%\)\s+-R\$ 10,00/);
    assert.match(saida, /Desconto de 10% aplicado/);
  });

  test("C25 — comprar com o carrinho vazio não cobra nada", async () => {
    const saida = await executarLoja([COMPRAR, SAIR]);

    assert.match(saida, /O carrinho está vazio/);
    assert.doesNotMatch(saida, /RESUMO DA COMPRA/);
  });
});

describe("cadastro de produtos pela linha de comando", () => {
  test("um produto cadastrado aparece na listagem", async () => {
    const saida = await executarLoja([
      CADASTRAR, "Monitor 24 polegadas", "899.90",
      LISTAR,
      SAIR,
    ]);

    assert.match(saida, /Produto \[4\] Monitor 24 polegadas cadastrado/);
    assert.match(saida, /\[4\] Monitor 24 polegadas\s+R\$ 899,90/);
  });

  test("um preço inválido é recusado e o produto não entra na lista", async () => {
    const saida = await executarLoja([
      CADASTRAR, "Produto de graça", "0",
      LISTAR,
      SAIR,
    ]);

    assert.match(saida, /Erro: O preço deve ser maior que zero/);
    assert.doesNotMatch(saida, /Produto de graça/);
  });
});

describe("validações do carrinho pela linha de comando", () => {
  test("quantidade 0 é recusada e o carrinho continua vazio", async () => {
    const saida = await executarLoja([
      AO_CARRINHO, TECLADO, "0",
      VER_CARRINHO,
      SAIR,
    ]);

    assert.match(saida, /Erro: A quantidade deve ser maior que zero/);
    assert.match(saida, /O carrinho está vazio/);
  });

  test("um código de produto inexistente é recusado", async () => {
    const saida = await executarLoja([AO_CARRINHO, "999", SAIR]);

    assert.match(saida, /Erro: Não existe produto com o código 999/);
  });

  test("uma opção inválida do menu não derruba o programa", async () => {
    const saida = await executarLoja(["99", LISTAR, SAIR]);

    assert.match(saida, /Opção inválida/);
    assert.match(saida, /PRODUTOS/);
    assert.match(saida, /Até logo/);
  });
});
