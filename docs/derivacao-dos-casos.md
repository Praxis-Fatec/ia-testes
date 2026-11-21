# Derivação dos casos de teste com apoio de IA

Este documento é a etapa 2 e a etapa 3 do fluxo apresentado no slide: a IA
recebe o requisito e devolve casos candidatos, e uma pessoa revisa o que entra,
o que sai e o que muda antes de virar teste executável.

A IA usada foi o assistente de desenvolvimento (Claude), durante a construção
deste repositório. O que ela produziu está na tabela de candidatos; o que
sobreviveu à revisão está na tabela de mapeamento, e cada linha aponta para um
teste que existe no código.

```
1. REQUISITO  →  2. IA GERA CANDIDATOS  →  3. REVISÃO HUMANA  →  4. TESTES EXECUTÁVEIS
```

---

## 1. O requisito

> **RN-01** — Subtotal igual ou maior que R$ 100,00 recebe 10% de desconto.

Dois requisitos de apoio apareceram enquanto o caso era detalhado, porque sem
eles a regra não é testável de ponta a ponta:

> **RN-02** — Um produto tem nome e preço. O preço é maior que zero e tem no
> máximo duas casas decimais.
>
> **RN-03** — A quantidade de um item no carrinho é um inteiro maior que zero.

---

## 2. Casos candidatos derivados pela IA

As técnicas aplicadas são as clássicas de teste de caixa-preta: **análise de
valor limite** e **particionamento em classes de equivalência**. O limite da
RN-01 é R$ 100,00, então as classes são três.

### Classes de equivalência do subtotal

| Classe | Faixa | Desconto esperado |
|---|---|---|
| Inválida | carrinho vazio | não há compra |
| Válida, abaixo do limite | R$ 0,01 a R$ 99,99 | R$ 0,00 |
| Válida, no limite ou acima | R$ 100,00 em diante | 10% do subtotal |

### Valor limite em torno de R$ 100,00

| # | Subtotal | Desconto esperado | Total esperado |
|---|---|---|---|
| C01 | R$ 99,98 | R$ 0,00 | R$ 99,98 |
| C02 | R$ 99,99 | R$ 0,00 | R$ 99,99 |
| C03 | R$ 100,00 | R$ 10,00 | R$ 90,00 |
| C04 | R$ 100,01 | R$ 10,00 | R$ 90,01 |

C02 e C03 são o par que de fato prova a regra: um centavo separa os dois e o
comportamento muda. C04 existe por causa do arredondamento — 10% de R$ 100,01
é R$ 10,001, que em centavos é R$ 10,00 e não R$ 10,01.

### Limite atravessado pela multiplicação, não pelo preço

| # | Carrinho | Subtotal | Desconto |
|---|---|---|---|
| C05 | 3 x R$ 33,33 | R$ 99,99 | R$ 0,00 |
| C06 | 3 x R$ 33,34 | R$ 100,02 | R$ 10,00 |

Um centavo no preço unitário vira três no subtotal e cruza o limite. É o caso
que um teste escrito só com valores redondos não encontra.

### Arredondamento do desconto

| # | Subtotal | Desconto esperado |
|---|---|---|
| C07 | R$ 100,05 | R$ 10,01 |
| C08 | R$ 129,90 | R$ 12,99 |

### Entradas inválidas

| # | Entrada | Resultado esperado |
|---|---|---|
| C09 | Quantidade 0 | recusa: quantidade deve ser maior que zero |
| C10 | Quantidade −1 | recusa: quantidade deve ser maior que zero |
| C11 | Quantidade 1,5 | recusa: quantidade deve ser inteira |
| C12 | Quantidade 1000 | recusa: acima do máximo de 999 |
| C13 | Preço 0 | recusa: preço deve ser maior que zero |
| C14 | Preço −10 | recusa: preço deve ser maior que zero |
| C15 | Preço 10,555 | recusa: no máximo duas casas decimais |
| C16 | Preço não numérico | recusa: preço deve ser um número |
| C17 | Nome vazio | recusa: nome é obrigatório |
| C18 | Nome só com espaços | recusa: nome é obrigatório |
| C19 | Nome com 61 caracteres | recusa: até 60 caracteres |
| C20 | Editar produto inexistente | recusa: código não existe |
| C21 | Excluir produto inexistente | recusa: código não existe |

### Comportamento do carrinho

| # | Cenário | Resultado esperado |
|---|---|---|
| C22 | Mesmo produto adicionado duas vezes | quantidades somam, um item só |
| C23 | Produtos diferentes | dois itens, subtotal somado |
| C24 | Remover item do carrinho | item sai, subtotal recalculado |
| C25 | Comprar com carrinho vazio | recusa, nada é cobrado |

---

## 3. Revisão humana

A revisão é o que o slide chama de etapa 3, e ela não é formalidade: dos casos
que a IA ofereceu, alguns foram descartados e dois foram corrigidos.

### Aceitos sem mudança

C01 a C14, C17, C18, C20 a C25. São casos de limite, de classe de
equivalência e de erro que correspondem a regras escritas.

### Corrigidos na revisão

| Caso | O que a IA propôs | O que ficou | Por quê |
|---|---|---|---|
| C04 | Desconto de R$ 10,01 para subtotal de R$ 100,01 | R$ 10,00 | 10% de 100,01 é 10,001, e dinheiro é arredondado em centavos. O valor esperado proposto estava errado. |
| C15 | Aceitar preço com três casas decimais | Recusar | A IA tratou o preço como número livre. Em preço de produto, meio centavo não existe, então a RN-02 foi escrita para fechar isso. |

### Rejeitados

| Caso proposto | Por que não entrou |
|---|---|
| Subtotal negativo recebe desconto? | Impossível de alcançar: o preço é maior que zero e a quantidade também, então não existe caminho que produza subtotal negativo. Testar isso mede o teste, não o sistema. |
| Desconto de 100% para carrinho muito grande | Não existe na RN-01. A IA inventou uma regra que ninguém pediu, que é exatamente o risco citado no slide em "pode interpretar requisitos de forma incorreta". |
| Usuário sem login não recebe desconto | Não há login no escopo deste exemplo. |
| Quantidade 1.000.000 | Já coberto por C12, que está no limite da classe. Um valor mais alto não exercita nada de novo. |
| Dois produtos com o mesmo nome | Nenhuma regra proíbe, então não há resultado esperado a afirmar. |

**O que a revisão mostra.** Dos 25 candidatos, 23 entraram, 2 precisaram de
correção no resultado esperado e 5 propostas foram descartadas. A IA foi boa
em cobrir limites e entradas inválidas, que é trabalho mecânico e cansativo, e
errou justamente onde era preciso conhecer a regra de negócio — arredondamento
de dinheiro e uma regra inventada que não existia. É esse o motivo de a etapa 3
existir no fluxo.

---

## 4. Mapeamento para os testes executáveis

### Testes de unidade

| Casos | Arquivo |
|---|---|
| C01 a C08 | `testes/unidade/desconto.test.ts` |
| C09 a C12, C22 a C24 | `testes/unidade/carrinho.test.ts` |
| C13 a C19 | `testes/unidade/produto.test.ts` |
| C20, C21 | `testes/unidade/catalogo.test.ts` |

### Testes de sistema

| Cenário | Arquivo |
|---|---|
| Compra abaixo do limite, pela CLI, sem desconto | `testes/sistema/fluxo-compra.test.ts` |
| Compra no limite exato, pela CLI, com 10% | `testes/sistema/fluxo-compra.test.ts` |
| Cadastro de produto e compra na mesma sessão | `testes/sistema/fluxo-compra.test.ts` |
| C25, comprar com carrinho vazio | `testes/sistema/fluxo-compra.test.ts` |

A diferença entre os dois níveis é o que o tema pede. O teste de unidade chama
`calcularDesconto` e afirma um número. O teste de sistema abre o programa,
digita as mesmas opções que uma pessoa digitaria e lê o que apareceu na tela —
se o menu, a leitura do teclado ou a formatação quebrarem, só o segundo
percebe.
