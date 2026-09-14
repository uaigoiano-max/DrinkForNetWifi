# DrinkForNet Wi-Fi 🚀

[Português](README.md) · [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-c6ff4d?style=flat-square&labelColor=0a1120)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML-static-c6ff4d?style=flat-square&labelColor=0a1120)](wifi-free.html)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-c6ff4d?style=flat-square&labelColor=0a1120)](script.js)

> **An open-source portable captive-portal experience for turning connectivity into a real-world social interaction.**

> **Current version — prepared MVP (release candidate):** includes a
> dependency-conscious Lua + shell OpenWrt core, persistent local vouchers and
> a mobile admin panel. Sessions are exactly **1500 seconds (25 minutes)**.
> Physical validation is still pending on the exact Cudy TR1200 revision and
> event firmware; this is not production-certified. Read
> [architecture](docs/ARCHITECTURE.md), [deployment](docs/DEPLOYMENT.md), and
> [release notes](docs/RELEASE-NOTES.md).

## 🌐 Try the demo

**[▶️ Open the landing page](https://uaigoiano-max.github.io/DrinkForNetWifi/)**

The demo shows the visitor experience on desktop and mobile. The static page
is separate from the local OpenWrt core, which generates, persists, activates,
expires, and revokes vouchers without a computer during the event.

> **Archived version:** the personalized demonstration used before this repository became a reusable template is preserved in the [`v1.0-personal-template`](https://github.com/uaigoiano-max/DrinkForNetWifi/releases/tag/v1.0-personal-template) release. Use it for reference only; new projects should start from the current version.

## 📥 Download the project

Choose the option that fits your workflow:

### Option 1 — Download ZIP

Recommended if you do not use Git:

1. Open the repository on GitHub.
2. Click the green **Code** button.
3. Choose **Download ZIP**.
4. Extract the archive and open the `DrinkForNetWifi` folder.
5. Edit `config.js` to customize the project.

GitHub generates this ZIP automatically. The repository does not need to store a separate `.zip` file.

### Option 2 — Git

Recommended if you want to receive updates easily:

```bash
git clone https://github.com/uaigoiano-max/DrinkForNetWifi.git
cd DrinkForNetWifi
```

To download future updates:

```bash
git pull
```

Then follow the [Quickstart guide](QUICKSTART.md) to test the page and prepare the captive-portal files.

## What is DrinkForNet?

DrinkForNet is a reusable Wi-Fi landing page for a person who wants to bring a portable network to a party, festival or live event. The network does not need to be official or provided by the event organizers: it is made available by someone at the venue who wants to create a fun interaction with other people. The new interface makes the core exchange explicit: **one drink for the person providing the network unlocks 25 minutes of access**.

Instead of sharing a global password, the host can define a clear and voluntary exchange, such as:

- offering a drink;
- following a social profile;
- participating in content creation;
- sharing a profile or project;
- making a future donation;
- another interaction agreed with the host.

The visitor connects to the temporary Wi-Fi, sees the landing page, finds the person providing the network and receives an individual voucher. The router validates the voucher and grants temporary access.

> The interaction must be clear, optional and respectful. DrinkForNet is not an official event network unless the person operating it explicitly has that role.

## ✨ Features

- Responsive static landing page with no framework.
- Captive-portal form with firmware placeholders.
- Individual temporary voucher flow.
- Configurable host name, social links, texts and photos (the access duration is fixed at 25 minutes).
- Local-first operation for networks without external internet access.
- Accessible gallery with keyboard and reduced-motion support.
- Hardware guidance for travel routers, power banks and cables.
- Automatic validation for critical files and captive-portal placeholders.

## 📸 Preview

### Desktop

<p align="center">
  <img src="docs/screenshots/desktop.png" alt="DrinkForNet landing page desktop preview" width="900">
</p>

### Mobile

<p align="center">
  <img src="docs/screenshots/mobile.png" alt="DrinkForNet landing page mobile preview" width="390">
</p>

## 🚀 Quickstart

```bash
git clone https://github.com/uaigoiano-max/DrinkForNetWifi.git
cd DrinkForNetWifi
python -m http.server 8080
```

Open `http://localhost:8080/index.html`. For the captive-portal entry point, also test `http://localhost:8080/wifi-free.html`.

Run the project checks:

```bash
node scripts/validate-project.mjs
node --check script.js
node --check config.js
```

Read the full [Quickstart guide](QUICKSTART.md) for router deployment and physical testing.

## 🎛️ Customize the project

Start with [`config.js`](config.js):

```javascript
window.DrinkForNetConfig = {
    hostName: "Your name",
    nickname: "@yourprofile",
    accessMinutes: 25,
    socialLinks: {
        instagram: "https://instagram.com/yourprofile",
        x: "",
        spotify: ""
    },
    photos: [
        "minha-foto.jpg",
        "foto-2.jpg",
        "foto-3.jpg"
    ]
};
```

You can customize:

- host name and social profile;
- hero text and exchange rule;
- access duration;
- location instructions;
- photos and gallery caption;
- social links and colors.

Keep `index.html` and `wifi-free.html` synchronized. The captive portal form depends on these placeholders:

```html
$authaction
$tok
$redir
```

Do not remove or rename them without checking the captive-portal firmware documentation.

The main selectors used by `script.js` are `.brand-name`, `.network-label`, `.profile-name`, `.profile-nickname`, `.hero-label`, `.hero-description`, `.rule-description`, `.location-on-floor`, `.location-backstage`, `.footer-offer`, `.gallery-caption`, `.drink-rule` and `.access-minutes`. The gallery uses `#gallery`, `#galleryImage`, `#galleryPrev` and `#galleryNext`; the voucher form is `#voucherForm`. Usually you only need to edit `config.js`, not the HTML.

### Replace photos and adapt the visual system

Replace the images listed in `config.js` with photos you are authorized to publish. If you use different filenames, update the `photos` array there. Prefer compressed local images so the captive portal remains usable before external internet access is granted.

The main colors are CSS variables at the top of `style.css`:

```css
:root {
    --night: #111827;
    --cream: #f7f1e8;
    --pink: #ff725c;
    --yellow: #ffe36e;
    --blue: #a9d8ff;
}
```

The primary mobile breakpoint is `700px`. After changing the layout, test a narrow viewport and a desktop viewport, keep both HTML entry points identical, and run the validation commands before copying files to the router.

## 🧱 Architecture

The prepared MVP also includes `openwrt/` (Lua core, protected CGI, init/cron
and an explicit failing network adapter), `admin/` (a management-only mobile
panel), and the [deployment checklist](docs/DEPLOYMENT.md). Keep `admin/`
outside the visitor portal. The exact Cudy TR1200 revision and firmware still
require physical validation.

| Layer | Technology |
| --- | --- |
| Structure | Static HTML |
| Styling | Responsive CSS and native animations |
| Interaction | Vanilla JavaScript |
| Authentication | Captive-portal form placeholders |
| Hosting | Preferably local on the router or hotspot |
| Network | Guest Wi-Fi with captive portal |

The visitor page does not create the Wi-Fi network or enforce firewall rules.
The OpenWrt Lua core handles local voucher state; the network adapter remains an
explicit failing stub until tested against the actual captive-portal stack.
This repository makes no compatibility claim for OpenNDS, NoDogSplash, or Cudy
stock firmware.

## 🛰️ Hardware

See the complete [recommended hardware guide](docs/RECOMMENDED_HARDWARE.md) for:

- Cudy TR1200 travel router;
- Anker 25,000 mAh powerbank;
- USB-A to USB-C and USB-C to USB-C cables;
- power compatibility and testing instructions;
- captive-portal and voucher limitations.

Hardware recommendations are references, not guarantees. Confirm the exact model, firmware, input voltage, voucher support and expected number of clients before buying or operating at an event.

## 🔐 Safety and privacy

- Isolate guest clients from the administration network.
- Change default router credentials.
- Do not commit vouchers, keys, certificates or personal data.
- Test the captive portal with valid and invalid vouchers.
- Do not monitor people or intercept traffic.
- Respect the rules of the event, venue and internet provider.

Read [SECURITY.md](SECURITY.md) for reporting and operational guidance.

## 💡 Roadmap: Pix donations

The Portuguese version documents a planned future feature for donation-based access using Pix in Brazil. This feature is not implemented yet.

A safe implementation will require payment confirmation, fraud prevention, privacy protection and a secure captive-portal integration. Do not publish a real Pix key or promise automatic access based only on a form or payment screenshot.

People interested in contributing to this future feature can send a private message to the project maintainer with their experience and proposed contribution.

## 🤝 Contributing

Contributions are welcome through Pull Requests. Please read:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

The `main` branch requires a Pull Request and a successful validation workflow. External contributions require review before merging; repository administrators may merge their own reviewed Pull Requests.

## 📄 License

This project is available under the [MIT License](LICENSE).
