# Poke Trader

![Image Poke Trader Nathan](https://raw.githubusercontent.com/nathanopereira/poke-trader/main/public/print.png)

## Demo
[https://poke-trader.vercel.app/](https://poke-trader.vercel.app/)

## Resumo
Poke Trader é uma calculadora de trocas de pokémons. Ela permite calcular se uma troca é justa ou não a partir da soma da experiência base (base_experience) dos pokémons dos jogadores. Também permite armazenar as trocas calculadas.

### Troca Justa
Uma troca é considerada justa se a soma da experiência base dos pokémons não exceder **10 pontos** de diferença dos pokémons do outro jogador.

**Exemplos**
- Trocas justas
  - Jogador 1 = 40 / Jogador 2 = 40
  - Jogador 1 = 40 / Jogador 2 = 50
  - Jogador 1 = 40 / Jogador 2 = 30
- Trocas injustas
  - Jogador 1 = 40 / Jogador 2 = 80
  - Jogador 1 = 40 / Jogador 2 = 10

## Rodar o projeto

### Requisitos
- Necessário ter o [NodeJS](https://nodejs.org/en/download/) instalado

### Rodando o projeto
- Clone este repositório
- Acesse a pasta do projeto e rode `npm install`
- Aguarde a instalação dos pacotes
- Rode `npm run dev`
- Acesse [http://localhost:3000](http://localhost:**3000**)
