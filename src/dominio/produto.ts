export type Produto = {
  id: number;
  nome: string;
  preco: number;
};

export type Validacao =
  | { valido: true }
  | { valido: false; erro: string };

export const PRECO_MAXIMO = 1_000_000;

export function validarNome(nome: string): Validacao {
  if (nome.trim() === "") {
    return { valido: false, erro: "O nome do produto é obrigatório." };
  }
  if (nome.trim().length > 60) {
    return { valido: false, erro: "O nome do produto deve ter até 60 caracteres." };
  }
  return { valido: true };
}

export function validarPreco(preco: number): Validacao {
  if (!Number.isFinite(preco)) {
    return { valido: false, erro: "O preço deve ser um número." };
  }
  if (preco <= 0) {
    return { valido: false, erro: "O preço deve ser maior que zero." };
  }
  if (preco > PRECO_MAXIMO) {
    return { valido: false, erro: `O preço deve ser de no máximo ${PRECO_MAXIMO}.` };
  }
  if (arredondaParaOutroValor(preco)) {
    return { valido: false, erro: "O preço deve ter no máximo duas casas decimais." };
  }
  return { valido: true };
}

export function validarProduto(nome: string, preco: number): Validacao {
  const doNome = validarNome(nome);
  if (!doNome.valido) {
    return doNome;
  }
  return validarPreco(preco);
}

function arredondaParaOutroValor(preco: number): boolean {
  const emCentavos = preco * 100;
  return Math.abs(emCentavos - Math.round(emCentavos)) > 1e-6;
}
