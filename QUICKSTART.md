# Quickstart

Este guia coloca uma cópia do DrinkForNet para funcionar com o mínimo de passos.

> **MVP preparado / release candidate:** a duração é fixa em 1500 segundos
> (25 minutos), e a validação física do Cudy TR1200 depende da revisão e do
> firmware exatos. Não é uma certificação de produção. O núcleo local roda no
> OpenWrt; não depende de um computador durante o evento. Consulte
> [arquitetura](docs/ARCHITECTURE.md) e [implantação](docs/DEPLOYMENT.md).

## 1. Baixe e abra o projeto

### Pelo GitHub (Download ZIP)

1. Abra o repositório no GitHub.
2. Clique em **Code** e depois em **Download ZIP**.
3. Extraia o arquivo e abra a pasta extraída.

### Pelo Git

Se o Git estiver instalado:

```bash
git clone https://github.com/uaigoiano-max/DrinkForNetWifi.git
cd DrinkForNetWifi
```

O download por ZIP é mais simples para começar. O Git é melhor para acompanhar atualizações com `git pull`.

## 2. Personalize `config.js`

Altere nome, apelido, textos, redes sociais e fotos em `config.js`. A duração
não é configurável: permanece exatamente em 25 minutos. Os arquivos
`index.html` e `wifi-free.html` carregam essa configuração antes do JavaScript
da página.

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

## 4. Prepare o núcleo local no OpenWrt

O diretório `openwrt/` contém o núcleo Lua, CGI administrativo, cron, init e
um adaptador de rede deliberadamente seguro. Copie os arquivos conforme
[DEPLOYMENT.md](docs/DEPLOYMENT.md), configure `/etc/drinkfornet/admin.token`
fora do repositório e mantenha `admin/` fora do portal de visitantes. O núcleo
usa `/dev/urandom`, `sha256sum`, persistência TSV atômica e grava somente
digests dos vouchers.

O painel móvel mostra status, vouchers/sessões, geração e revogação. Ele exige
o token do administrador e deve ficar acessível somente na rede de gestão.

## 5. Configure o captive portal

O projeto web não cria a rede nem aplica regras de firewall sozinho. O núcleo
OpenWrt local cuida dos vouchers; no roteador ou hotspot:

1. Atualize o firmware e troque a senha administrativa.
2. Configure a origem da internet.
3. Crie uma rede de visitantes isolada da rede administrativa.
4. Ative captive portal, hotspot ou guest authentication.
5. Configure a duração de exatamente 1500 segundos (25 minutos).
6. Copie `wifi-free.html`, `style.css`, `script.js`, `config.js` e todas as fotos listadas em `config.js` para a pasta do portal.
7. Preserve os placeholders `$authaction`, `$tok` e `$redir`.
8. Gere vouchers de teste e valide acesso, erro e expiração.

O caminho da pasta varia. Exemplos comuns são `/www/portal/`, `/etc/opennds/htdocs/` e `/etc/nodogsplash/htdocs/`.

O `drinkfornet-adapter` falha explicitamente enquanto não houver um backend de
firewall/captive portal testado. Não substitua o stub por suposições sobre
OpenNDS, NoDogSplash ou firmware Cudy.

## 6. Faça o teste físico

Antes do evento, teste durante algumas horas com o mesmo roteador, powerbank, cabos, firmware e portal que serão usados. Verifique reinicializações, reconciliação, ativação única, expiração de 25
minutos, revogação, aquecimento, cobertura, isolamento entre clientes,
velocidade, enforcement do firewall e desligamento automático do powerbank no
TR1200 exato. Até concluir isso, trate o release como candidato.

## Qual arquivo editar?

| Objetivo | Arquivo |
| --- | --- |
| Nome, textos, redes sociais e fotos | `config.js` |
| Layout e cores | `style.css` |
| Formulário e estrutura da página | `wifi-free.html` e `index.html` |
| Hardware e cabos recomendados | `docs/RECOMMENDED_HARDWARE.md` |
| Regras de contribuição | `CONTRIBUTING.md` |
| Validação local | `scripts/validate-project.mjs` |
