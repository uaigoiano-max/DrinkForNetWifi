# Release notes — prepared MVP candidate

## Next project version

- Added a dependency-conscious Lua voucher core for OpenWrt.
- Added digest-only persistence, atomic writes, lock-protected activation,
  explicit voucher states, 1500-second sessions, reconciliation, and audit
  entries.
- Added a protected, mobile-friendly admin panel and a local CGI boundary.
- Added init/cron files and an intentionally failing network-enforcement
  adapter.
- Kept the visitor portal static and retained captive placeholders.

## Validation status

This is **not production-certified**. Physical validation is pending on the
exact Cudy TR1200 hardware revision and firmware that will be used. OpenNDS,
NoDogSplash, stock Cudy firmware, firewall rules, power, radio coverage, and
client disconnect behavior are not claimed compatible by this repository.
