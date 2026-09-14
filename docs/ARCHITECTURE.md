# DrinkForNet prepared MVP architecture

This release adds a small Lua + shell control plane for OpenWrt. It is a
**release candidate / prepared MVP, not production-certified**. The exact Cudy
TR1200 hardware revision and firmware still require physical validation.

```text
visitor portal (unchanged HTML + firmware placeholders)
                 |
                 | captive-portal adapter (not bundled as a working backend)
                 v
       drinkfornet-adapter -> drinkfornet-core.lua
                                  |
                         atomic TSV + audit.log
                                  ^
             admin/index.html -> protected local CGI
```

## Voucher core

`openwrt/usr/libexec/drinkfornet-core.lua` uses `/dev/urandom` and the
OpenWrt `sha256sum` boundary. It stores only SHA-256 digests, never generated
codes. Codes are normalized before hashing. A locked, temporary-file-and-rename
write makes activation a single state transition:

`AVAILABLE -> ACTIVE (1500 seconds) -> EXPIRED`

An operator may move `AVAILABLE` or `ACTIVE` to `REVOKED`. Invalid, expired,
revoked, or already active codes do not consume a new voucher. Reconciliation
runs at init and every minute from cron, so an interrupted boot does not leave
expired sessions marked active.

The audit log records timestamps, voucher IDs, state, and operation; it does
not record voucher values.

## Integration boundary

`drinkfornet-adapter` is intentionally a failing stub for network enforcement.
It validates and consumes a code, then revokes it if the unimplemented
`authorize` operation cannot install a firewall/captive-portal session. This
prevents an untested integration from silently granting access. No claim is
made about OpenNDS, NoDogSplash, or Cudy stock firmware compatibility.

## Admin boundary

The static files in `admin/` must be served on the management network, not
copied into the visitor portal. The CGI requires an operator token in
`/etc/drinkfornet/admin.token`, compares it from an HTTP header, and sends
`Cache-Control: no-store`. Put the CGI behind the router's HTTPS/admin
restriction where available; this MVP does not provide TLS or user accounts.
