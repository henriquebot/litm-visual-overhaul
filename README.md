# LiTM Visual Overhaul

Módulo visual independente para o sistema oficial **Legend In The Mist** (`mist-engine-fvtt`) no Foundry VTT.

## Objetivo

O LiTM Visual Overhaul é uma camada opcional sobre o sistema oficial. O foco continua sendo a apresentação visual; adicionalmente, pode habilitar pequenas extensões de regras que existem no livro, mas ainda não estão automatizadas pelo sistema oficial. O módulo não altera atores, itens, mundos ou compêndios e pode ser ativado apenas nos mundos desejados.

## Recursos

- Tema **Sci-Fi HUD**.
- Opção **Oficial / Sem Alterações**.
- Cor de destaque principal configurável.
- Cor secundária configurável.
- Intensidade de brilho neon.
- Cards angulares opcionais.
- Scanlines sutis opcionais.
- Interface compacta opcional.
- Customização de fichas, cards, tags, status, limites, botões, abas, chat, janela de rolagem e aplicativos do Mist Engine.
- Ficha de Challenge em Sci-Fi HUD, incluindo Limits, Mighty Aspects, Special Features e Threats & Consequences.

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

Versão atual do módulo: **0.5.7** — visual Sci-Fi opcional, tradução isolada dos cards e extensões de rolagem da p. 158.


## Roadmap

O planejamento de estabilização, cobertura do sistema e 1.0 está em [ROADMAP.md](ROADMAP.md) e nas Issues do repositório.

A partir da série 0.5.x, a regra do projeto é preservar a geometria oficial do Mist Engine e alterar prioritariamente skin, contraste, cores e efeitos.


### Tradução opcional dos cards de resultado

O módulo pode traduzir somente os cards de resultado das rolagens no chat para Português (Brasil), sem alterar o idioma das fichas, menus, compêndios ou janelas de rolagem.

A opção fica em **Configurações do Módulo → Tradução dos Cards de Resultado**.


### Regras avançadas da página 158

A opção **Regras Avançadas de Rolagem (p. 158)** adiciona, sem modificar o código do sistema oficial:

- **Throw Caution to the Wind** em rolagens Detailed com Poder final 2 ou menos: −1 na rolagem e, em caso de sucesso, Poder original +1 para gastar.
- **Hedge Your Risks** em rolagens Detailed com Poder final 2 ou mais: +1 na rolagem e, em caso de sucesso, Poder original −1 para gastar.
- **Push Your Luck** após um 10+ Quick: aceita Consequências e transforma o resultado em **Great Success**.
- **Push Your Luck** após um 10+ Detailed: aceita Consequências e adiciona **+1 Poder** ao painel de gasto.

O estado dessas opções é salvo em flags próprias do módulo nas mensagens de chat. A extensão pode ser desligada nas configurações do módulo.
