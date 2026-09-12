# Contributing to DrinkForNet Wi-Fi

Obrigado por querer melhorar o DrinkForNet Wi-Fi.

## Antes de começar

- Abra uma issue para mudanças grandes de comportamento ou arquitetura.
- Não envie vouchers reais, senhas, tokens, logs ou dados de participantes.
- Não envie fotos de pessoas sem autorização.
- Mantenha a landing page funcional sem depender de frameworks.
- Preserve acessibilidade, responsividade e suporte ao captive portal.

## Desenvolvimento local

```bash
python -m http.server 8080
```

Abra `http://localhost:8080/` no navegador. O servidor local valida a interface, mas não simula a autenticação do roteador.

## Personalização

Para criar uma versão para outro evento, comece por `config.js`. Evite espalhar nomes, links e fotos diretamente pelo HTML.

## Pull requests

Descreva:

- o problema resolvido;
- o comportamento alterado;
- como a mudança foi testada;
- screenshots quando houver alteração visual;
- o captive portal ou firmware usado, se aplicável.

Antes de abrir o pull request:

- valide `node --check script.js`;
- teste em uma tela mobile;
- teste teclado e foco;
- confirme que os placeholders do captive portal foram preservados;
- confirme que nenhum segredo ou voucher real foi incluído.
