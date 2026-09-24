# LiTM Visual Overhaul

Módulo visual independente para o sistema oficial **Legend In The Mist** (`mist-engine-fvtt`) no Foundry VTT.

## Objetivo

O LiTM Visual Overhaul altera somente a apresentação visual do sistema oficial. Ele não modifica regras, atores, itens, mundos ou compêndios e pode ser ativado apenas nos mundos desejados.

## Recursos da versão 0.1.0

- Tema **Sci-Fi HUD**.
- Opção **Oficial / Sem Alterações**.
- Cor de destaque principal configurável.
- Cor secundária configurável.
- Intensidade de brilho neon.
- Cards angulares opcionais.
- Scanlines sutis opcionais.
- Interface compacta opcional.
- Customização de fichas, cards, tags, status, limites, botões, abas, chat, janela de rolagem e aplicativos do Mist Engine.

## Instalação por manifesto

Depois que o repositório estiver público e a primeira release estiver publicada, use no Foundry:

`https://github.com/henriquebot/litm-visual-overhaul/releases/latest/download/module.json`

O Foundry usa esse mesmo manifesto para detectar novas versões.

## Atualizações

O workflow em `.github/workflows/release.yml` gera automaticamente uma release com:

- `module.json`
- `litm-visual-overhaul.zip`

Para publicar uma atualização:

1. altere o código;
2. aumente a versão em `module.json`;
3. envie para a branch `main`.

O GitHub Actions valida o módulo, cria o ZIP e publica a release correspondente.

## Ativação por mundo

O módulo é ativado em **Gerenciar Módulos** dentro de cada mundo. Se você não ativá-lo em outro mundo Legend In The Mist, esse outro mundo continua usando o visual oficial.

## Compatibilidade

- Foundry VTT 13+
- Estrutura validada para Foundry VTT 14
- Mist Engine / Legend In The Mist 14.5.x

## Licença

MIT. Legend In The Mist e o sistema oficial pertencem aos seus respectivos detentores.


## Estado do projeto

Primeira versão publicável: **0.1.0**.
