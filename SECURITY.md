# Segurança

## Limites do MVP

Esta versão é um release candidate preparado, não certificado para produção.
O núcleo Lua foi desenhado para OpenWrt e não exige computador durante o
evento, mas ainda falta validar fisicamente a revisão exata do Cudy TR1200, o
firmware e o backend de firewall/captive portal: a **validação física do Cudy
TR1200 está pendente**. Os stubs de autorização
falham explicitamente; nunca presuma compatibilidade com OpenNDS, NoDogSplash
ou firmware Cudy.

O painel em `admin/` não pertence ao portal de visitantes. Sirva-o somente na
rede de administração, use HTTPS/restrição do servidor quando disponível e
proteja `/etc/drinkfornet/admin.token`. O CGI não implementa contas, TLS ou
controle de papéis.

## Não publique segredos

Nunca envie para este repositório:

- senhas de roteadores;
- vouchers reais ou lotes de vouchers;
- tokens de autenticação;
- arquivos `.env`, `.key`, `.pem` ou `.crt`;
- logs com dados de visitantes;
- configurações administrativas exportadas do hotspot.
- o arquivo `/var/lib/drinkfornet/audit.log` em relatórios públicos;
- o arquivo `/var/lib/drinkfornet/vouchers.tsv` (contém digests operacionais).

O núcleo persiste apenas digests SHA-256 e nunca grava os códigos emitidos.
Mesmo assim, trate tokens entregues e logs locais como informação operacional
sensível.

## Reportar vulnerabilidades

Não publique uma vulnerabilidade com detalhes sensíveis em uma issue pública. Entre em contato com o mantenedor do repositório pelo perfil do GitHub para combinar um canal privado de comunicação.

Ao reportar, inclua:

- descrição do problema;
- passos para reproduzir;
- modelo e firmware afetados;
- impacto esperado;
- sugestão de correção, se houver.

O DrinkForNet não deve ser usado para interceptar tráfego, monitorar pessoas ou coletar dados além do necessário para autenticação consentida.
