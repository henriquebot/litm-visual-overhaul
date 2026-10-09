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
- Integração opcional com **SC – Jump Scare** para exibir os sustos também ao mestre.

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

Versão atual do módulo: **0.5.11** — visual Sci-Fi opcional, tradução isolada dos cards e extensões de rolagem da p. 158.


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


### Integração opcional: SC – Jump Scare

A opção **Mostrar Jump Scares também para o Mestre** pode ser ativada nas configurações do LiTM Visual Overhaul. Ela vem **desativada** por padrão.

Quando o **SC – Jump Scare** estiver instalado e ativo, o mestre que disparar um susto também o receberá na própria tela, inclusive usando **Trigger Now**, **macros** e **gatilhos por região**. Os destinatários originais permanecem selecionados; as preferências de opt-out e os limites de segurança do SC – Jump Scare continuam valendo. As prévias locais não são afetadas.

O recurso é exclusivo dos mundos Legend In The Mist que tenham o LiTM Visual Overhaul ativo, e depende da implementação de `ScareTrigger.trigger()` presente no SC – Jump Scare **1.0.2**. Atualizações do SC – Jump Scare podem exigir revisão dessa integração.


#### Sustos acima dos painéis (VDO.Ninja)

A opção **Exibir Jump Scares acima dos painéis (VDO.Ninja)** coloca a imagem do SC – Jump Scare acima das janelas e painéis do Foundry, inclusive as câmeras do VDO.Ninja. É uma opção independente de **Mostrar Jump Scares também para o Mestre** e vem **ativada** por padrão para mestre e jogadores, evitando que as câmeras cubram o susto. Ela pode ser desativada nas configurações do mundo e funciona em qualquer cliente conectado ao mundo com o módulo ativo e pode ser alterada sem recarregar a página.

O efeito só altera o `z-index` do overlay do SC – Jump Scare, com a classe obtida dinamicamente do próprio módulo (testada no SC – Jump Scare 1.0.2); não modifica os arquivos do SC – Jump Scare nem do VDO.Ninja. Enquanto o susto estiver em exibição, ele cobrirá painéis e janelas; a tecla **Esc** permanece disponível para encerrar o susto.

#### Ajuste dinâmico do painel VDO.Ninja e confirmação discreta

Com **Respeitar o limite do painel RPGUP VDO.Ninja** (ligada por padrão), os sustos aparecem na região do jogo imediatamente à direita do painel, sem cobrir as câmeras. O limite horizontal acompanha dinamicamente o tamanho, movimento, minimização e fechamento da janela através de observadores de DOM e layout, sem pixels fixos. Se não houver painel, a área inteira do canvas é usada.

A opção **Ocultar avisos azuis de disparo do Jump Scare** (ligada por padrão) remove somente as confirmações informativas de disparo apresentadas ao mestre pelo SC – Jump Scare 1.0.2. Erros, opt-out e avisos de segurança permanecem disponíveis. A integração apenas filtra a confirmação durante o disparo, sem modificar os arquivos do módulo original.
