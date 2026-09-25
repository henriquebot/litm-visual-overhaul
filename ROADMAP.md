# Roadmap — LiTM Visual Overhaul

O roadmap é acompanhado pelas Issues do repositório.

## 0.5.0 — Estabilização e refactor

- #1 Refatorar `overhaul.css` e remover hotfixes duplicados.
- #2 Auditoria completa da ficha de personagem.
- #3 Padronizar estados semânticos de Tags e Status.

Objetivo: uma base visual previsível, sem alterações estruturais acidentais do sistema oficial.

## 0.5.2 — Extensões de regras do livro

- #9 Regras avançadas de rolagem da página 158: Trade Power e Push Your Luck.

As extensões de regras são opcionais e devem se apoiar no sistema oficial sem alterar seus arquivos.

## 0.6.0 — Cobertura do sistema

- #4 Roll HUDs 1:1 com a geometria oficial.
- #5 Auditoria de todos os cards de resultado no chat.
- #6 Aplicar Visual Overhaul às demais fichas e apps.

## 1.0.0 — Produto final

- #7 Presets visuais e controles de tema.
- #8 Diagnóstico, cache e documentação final.

## Política de layout

A regra principal do projeto é preservar a geometria oficial do Mist Engine sempre que possível.

O módulo pode alterar:
- cores;
- fundos;
- bordas;
- contraste;
- efeitos de seleção;
- decoração;
- pequenos espaçamentos deliberados.

Mudanças estruturais de tamanho, posição ou fluxo devem ser específicas, documentadas e justificadas.
