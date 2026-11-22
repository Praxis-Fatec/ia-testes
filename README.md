# LAB V — Apoio da IA na derivação de casos/cenários de teste

Exemplo prático do tema **"Apoio da IA na derivação de Casos/Cenários de Teste
em nível de Unidade e Sistema"**.

Uma loja de linha de comando, em TypeScript, com uma regra de negócio simples.
A IA recebeu a regra, derivou 25 casos candidatos, uma pessoa revisou o que
entrava, e o que sobrou virou **59 testes automatizados** nos dois níveis que o
tema pede.

Giovana Zucareli e Pedro Henrique — Praxis 2026.

---

## A regra de negócio

> Subtotal igual ou maior que **R$ 100,00** recebe **10% de desconto**.

---

## Como rodar

Precisa apenas do **Node.js 24**, que executa TypeScript sem passo de build.

```bash
npm install     # instala só o TypeScript, para checagem de tipos
npm start       # abre a loja
npm test        # roda os 59 testes
```

Outros comandos:

```bash
npm run test:unidade    # 49 testes de unidade
npm run test:sistema    # 10 testes de sistema
npm run tipos           # checagem de tipos, sem gerar arquivos
```

---

## A loja

```
=== LOJA — LAB V ===
1) Listar produtos        5) Adicionar ao carrinho
2) Adicionar produto      6) Ver carrinho
3) Editar produto         7) Comprar
4) Excluir produto        0) Sair
```

O resumo da compra **sempre** mostra a linha de desconto, mesmo quando ela é
zero, e diz quanto falta para o limite. É assim que o efeito da regra fica
visível sem precisar explicar:

```
RESUMO DA COMPRA
------------------------------------------------
  1 x Teclado mecânico                  R$ 59,90
  1 x Mouse sem fio                     R$ 39,90
------------------------------------------------
  Subtotal                              R$ 99,80
  Desconto (10%)                        -R$ 0,00
------------------------------------------------
  TOTAL                                 R$ 99,80

Faltam R$ 0,20 para o desconto de 10%.
```

Adicione o headset e a mesma tela vira:

```
  1 x Headset                          R$ 129,90
------------------------------------------------
  Subtotal                             R$ 229,70
  Desconto (10%)                       -R$ 22,97
------------------------------------------------
  TOTAL                                R$ 206,73

Desconto de 10% aplicado: o subtotal atingiu R$ 100,00.
```

---

## O fluxo do slide, e onde cada etapa está no repositório

| | Etapa | Onde está |
|---|---|---|
| 1 | Requisito do sistema | [`docs/derivacao-dos-casos.md`](docs/derivacao-dos-casos.md) |
| 2 | IA gera casos candidatos | 25 candidatos, no mesmo documento |
| 3 | Revisão humana | 23 aceitos, 2 corrigidos, 5 rejeitados |
| 4 | Testes executáveis | `testes/unidade/` e `testes/sistema/` |

**A etapa 3 não é formalidade.** A IA acertou os limites e as entradas
inválidas, que é o trabalho mecânico, e errou onde era preciso conhecer o
negócio: propôs R$ 10,01 de desconto para um subtotal de R$ 100,01, quando 10%
de 100,01 é 10,001 e dinheiro se arredonda em centavos. Também inventou uma
regra de desconto de 100% que ninguém pediu. As duas correções estão
registradas no documento.

---

## Os dois níveis de teste

| | Unidade | Sistema |
|---|---|---|
| Quantos | 49 | 10 |
| O que chama | `calcularDesconto(100)` | o programa inteiro |
| Como verifica | compara um número | lê o que apareceu na tela |
| Pega | erro de cálculo | erro de menu, de leitura ou de formatação |

O teste de sistema abre o programa num processo separado, digita as mesmas
opções que uma pessoa digitaria e lê a saída. Se o menu quebrar, o cálculo
continua certo e só o teste de sistema percebe.

---

## Casos de borda que valem olhar

| Carrinho | Subtotal | Desconto |
|---|---|---|
| 3 x R$ 33,33 | R$ 99,99 | R$ 0,00 |
| 3 x R$ 33,34 | R$ 100,02 | R$ 10,00 |

Um centavo no preço unitário vira três no subtotal e atravessa o limite. Um
teste escrito só com valores redondos não encontra isso.

---

## Os testes foram provados quebrando o código

Teste que nunca falhou não prova nada. A regra foi alterada de propósito e os
testes foram rodados de novo:

| Alteração | Resultado |
|---|---|
| Limite de R$ 100,00 para R$ 90,00 | **7 de 59 falham** |
| Desconto de 10% para 20% | **10 de 59 falham** |
| Código original | 59 de 59 passam |

---

## Estrutura

```
src/
  dominio/
    produto.ts      validação de nome e preço
    catalogo.ts     adicionar, editar, excluir, buscar
    carrinho.ts     a regra de desconto
    dinheiro.ts     arredondamento em centavos e formatação
  cli/
    tela.ts         montagem das telas, em funções puras
    loja.ts         o menu interativo
  index.ts
testes/
  unidade/          49 testes
  sistema/          10 testes
docs/
  derivacao-dos-casos.md
```

O domínio é feito de funções puras que recebem um estado e devolvem outro.
Isso não é enfeite: é o que permite testar a regra de desconto sem abrir a
loja, montar carrinho ou simular teclado.

---

## Ferramentas

| | |
|---|---|
| TypeScript 5.9 | tipagem, executada nativamente pelo Node 24 |
| `node:test` | runner de testes nativo, sem dependência externa |
| `node:assert/strict` | asserções |
| `node:readline` | leitura do teclado |

O projeto tem **uma única dependência**, o próprio TypeScript, e apenas para
checar tipos. Não há framework de teste instalado.

---

## Referências

- BEZERRA, L. G. *Uso de IA generativa na geração automática de casos de teste
  unitários.* UnB, 2024.
- ARAUJO, C. S. *Inteligência artificial nas atividades de teste de software:
  um mapeamento sistemático da literatura.* UFC, 2026.
- MYERS, G. J.; SANDLER, C.; BADGETT, T. *The Art of Software Testing.* 3. ed.
  Wiley, 2011.
- NODE.JS. *Test runner.* Disponível em: https://nodejs.org/api/test.html
- TYPESCRIPT. *Documentação.* Disponível em: https://www.typescriptlang.org/docs/
