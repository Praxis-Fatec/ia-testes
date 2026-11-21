import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import {
  adicionarAoCarrinho,
  carrinhoVazio,
  resumirCompra,
  type Carrinho,
} from "../dominio/carrinho.ts";
import {
  adicionarProduto,
  buscarProduto,
  catalogoVazio,
  editarProduto,
  excluirProduto,
  type Catalogo,
} from "../dominio/catalogo.ts";
import { MENU, listarCarrinho, listarCatalogo, resumirNaTela } from "./tela.ts";

export function catalogoInicial(): Catalogo {
  let catalogo = catalogoVazio();
  for (const [nome, preco] of [
    ["Teclado mecânico", 59.9],
    ["Mouse sem fio", 39.9],
    ["Headset", 129.9],
  ] as const) {
    const alteracao = adicionarProduto(catalogo, nome, preco);
    if (alteracao.ok) {
      catalogo = alteracao.catalogo;
    }
  }
  return catalogo;
}

export async function executar(): Promise<void> {
  const leitor = createInterface({ input: stdin });
  const linhas = leitor[Symbol.asyncIterator]();
  let catalogo = catalogoInicial();
  let carrinho: Carrinho = carrinhoVazio();

  const perguntar = async (texto: string): Promise<string> => {
    stdout.write(texto);
    const linha = await linhas.next();
    if (linha.done === true) {
      return "0";
    }
    return linha.value.trim();
  };

  const lerPreco = async (): Promise<number> =>
    Number((await perguntar("Preço (ex.: 59.90): ")).replace(",", "."));

  while (true) {
    console.log(MENU);
    const opcao = await perguntar("Escolha: ");

    if (opcao === "0") {
      console.log("Até logo.");
      break;
    }

    if (opcao === "1") {
      console.log(listarCatalogo(catalogo));
      continue;
    }

    if (opcao === "2") {
      const nome = await perguntar("Nome do produto: ");
      const alteracao = adicionarProduto(catalogo, nome, await lerPreco());
      if (!alteracao.ok) {
        console.log(`Erro: ${alteracao.erro}`);
        continue;
      }
      catalogo = alteracao.catalogo;
      console.log(`Produto [${alteracao.produto.id}] ${alteracao.produto.nome} cadastrado.`);
      continue;
    }

    if (opcao === "3") {
      console.log(listarCatalogo(catalogo));
      const id = Number(await perguntar("Código do produto a editar: "));
      const nome = await perguntar("Novo nome: ");
      const alteracao = editarProduto(catalogo, id, nome, await lerPreco());
      if (!alteracao.ok) {
        console.log(`Erro: ${alteracao.erro}`);
        continue;
      }
      catalogo = alteracao.catalogo;
      console.log(`Produto [${id}] atualizado.`);
      continue;
    }

    if (opcao === "4") {
      console.log(listarCatalogo(catalogo));
      const id = Number(await perguntar("Código do produto a excluir: "));
      const remocao = excluirProduto(catalogo, id);
      if (!remocao.ok) {
        console.log(`Erro: ${remocao.erro}`);
        continue;
      }
      catalogo = remocao.catalogo;
      console.log(`Produto [${id}] excluído.`);
      continue;
    }

    if (opcao === "5") {
      console.log(listarCatalogo(catalogo));
      const id = Number(await perguntar("Código do produto: "));
      const produto = buscarProduto(catalogo, id);
      if (produto === undefined) {
        console.log(`Erro: Não existe produto com o código ${id}.`);
        continue;
      }
      const quantidade = Number(await perguntar("Quantidade: "));
      const insercao = adicionarAoCarrinho(carrinho, produto, quantidade);
      if (!insercao.ok) {
        console.log(`Erro: ${insercao.erro}`);
        continue;
      }
      carrinho = insercao.carrinho;
      console.log(`${quantidade} x ${produto.nome} no carrinho.`);
      continue;
    }

    if (opcao === "6") {
      console.log(listarCarrinho(carrinho));
      continue;
    }

    if (opcao === "7") {
      if (carrinho.itens.length === 0) {
        console.log("O carrinho está vazio.");
        continue;
      }
      console.log(resumirNaTela(carrinho, resumirCompra(carrinho)));
      console.log("\nCompra finalizada.");
      carrinho = carrinhoVazio();
      continue;
    }

    console.log("Opção inválida.");
  }

  leitor.close();
}
