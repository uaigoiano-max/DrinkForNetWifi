# OpenWrt deployment checklist

This is a prepared MVP deployment shape. It is not a claim that the Cudy
TR1200, any specific revision, or stock firmware supports these files.
Validate the exact device, firmware image, power arrangement, captive portal,
and firewall behavior before an event.

## Install the local core

Copy the repository's `openwrt/` tree to the matching filesystem locations:

```text
openwrt/usr/libexec/drinkfornet-core.lua -> /usr/libexec/drinkfornet-core.lua
openwrt/usr/sbin/drinkfornet-adapter     -> /usr/sbin/drinkfornet-adapter
openwrt/etc/init.d/drinkfornet           -> /etc/init.d/drinkfornet
openwrt/etc/cron.d/drinkfornet           -> /etc/cron.d/drinkfornet
openwrt/www/cgi-bin/drinkfornet.lua      -> /www/cgi-bin/drinkfornet.lua
```

Set executable permissions on the Lua core, adapter, init script, and CGI.
The image must provide Lua, `/dev/urandom`, `sha256sum`, `awk`, and a writable
`/var/lib/drinkfornet`. Do not install Node.js or Python on the router.

Create the admin token out-of-band and protect it:

```sh
umask 077
mkdir -p /etc/drinkfornet
printf '%s\n' 'replace-with-a-random-operator-token' > /etc/drinkfornet/admin.token
```

Do not commit that token. Serve `admin/` separately from the captive portal,
then configure its CGI URL if the web server is not rooted at `/www`.

## Network adapter

The adapter's `authorize` and `deauthorize` actions fail with status 78 until
an operator writes and tests a backend for the actual captive-portal and
firewall stack. Do not replace those stubs with guessed OpenNDS,
NoDogSplash, or vendor API calls. Record the tested client identity mapping,
disconnect behavior, and rollback procedure in the deployment notes.

The visitor `wifi-free.html` remains a static page with `$authaction`, `$tok`,
and `$redir` placeholders. Copy it only to the portal document root. Never
copy `admin/` there.

## Physical validation gate

Before calling this usable, test on the exact Cudy TR1200 revision and
firmware:

- reboot reconciliation and persistence;
- voucher generation, invalid input, one-time activation, 1500-second expiry,
  and revocation;
- captive portal redirect and client isolation;
- firewall authorization and forced disconnect after expiry;
- mobile admin access only from the management network;
- heat, power-bank behavior, coverage, and recovery from power loss.

Until those checks pass, this release is a candidate only.
