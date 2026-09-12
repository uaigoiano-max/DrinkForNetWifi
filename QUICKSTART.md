# Quickstart

Este guia coloca uma cópia do DrinkForNet para funcionar com o mínimo de passos.

## 1. Baixe e abra o projeto

```bash
git clone https://github.com/uaigoiano-max/DrinkForNetWifi.git
cd DrinkForNetWifi
```

## 2. Personalize `config.js`

Altere nome, apelido, textos, redes sociais, duração e fotos em `config.js`. Os arquivos `index.html` e `wifi-free.html` carregam essa configuração antes do JavaScript da página.

Mantenha as imagens listadas em `photos` na raiz do projeto ou atualize os caminhos. Use arquivos leves e confirme que os nomes diferenciam maiúsculas e minúsculas corretamente.

## 3. Teste a página localmente

```bash
python -m http.server 8080
```

Abra `http://localhost:8080/index.html` e confirme o layout, as fotos, os links sociais e a galeria. Para testar a entrada usada pelo captive portal, abra também `http://localhost:8080/wifi-free.html`.

Execute a validação automática:

```bash
node scripts/validate-project.mjs
```

## 4. Configure o captive portal

O projeto web não cria a rede, vouchers ou expiração sozinho. No roteador ou hotspot:

1. Atualize o firmware e troque a senha administrativa.
2. Configure a origem da internet.
3. Crie uma rede de visitantes isolada da rede administrativa.
4. Ative captive portal, hotspot ou guest authentication.
5. Configure a mesma duração definida em `config.js`.
6. Copie `wifi-free.html`, `style.css`, `script.js`, `config.js` e as três fotos para a pasta do portal.
7. Preserve os placeholders `$authaction`, `$tok` e `$redir`.
8. Gere vouchers de teste e valide acesso, erro e expiração.

O caminho da pasta varia. Exemplos comuns são `/www/portal/`, `/etc/opennds/htdocs/` e `/etc/nodogsplash/htdocs/`.

## 5. Faça o teste físico

Antes do evento, teste durante algumas horas com o mesmo roteador, powerbank, cabos, firmware e portal que serão usados. Verifique reinicializações, aquecimento, cobertura, isolamento entre clientes, velocidade e desligamento automático do powerbank.

## Qual arquivo editar?

| Objetivo | Arquivo |
| --- | --- |
| Nome, textos, duração, redes sociais e fotos | `config.js` |
| Layout e cores | `style.css` |
| Formulário e estrutura da página | `wifi-free.html` e `index.html` |
| Hardware e cabos recomendados | `docs/RECOMMENDED_HARDWARE.md` |
| Regras de contribuição | `CONTRIBUTING.md` |
| Validação local | `scripts/validate-project.mjs` |

