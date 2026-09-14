import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const requiredFiles = [
    "index.html",
    "wifi-free.html",
    "style.css",
    "script.js",
    "config.js",
    "minha-foto.jpg",
    "foto-2.jpg",
    "foto-3.jpg",
    "openwrt/usr/libexec/drinkfornet-core.lua",
    "openwrt/usr/sbin/drinkfornet-adapter",
    "openwrt/www/cgi-bin/drinkfornet.lua",
    "openwrt/etc/init.d/drinkfornet",
    "openwrt/etc/cron.d/drinkfornet",
    "admin/index.html",
    "admin/admin.css",
    "admin/admin.js",
    "docs/ARCHITECTURE.md",
    "docs/DEPLOYMENT.md",
    "docs/RELEASE-NOTES.md",
    "tests/test-core.sh"
];
const errors = [];

for (const relativePath of requiredFiles) {
    if (!existsSync(join(root, relativePath))) {
        errors.push(`Arquivo ausente: ${relativePath}`);
    }
}

const index = readFileSync(join(root, "index.html"), "utf8");
const captivePortal = readFileSync(join(root, "wifi-free.html"), "utf8");
if (index !== captivePortal) {
    errors.push("index.html e wifi-free.html precisam permanecer idênticos.");
}

for (const placeholder of ["$authaction", "$tok", "$redir"]) {
    if (!captivePortal.includes(placeholder)) {
        errors.push(`Placeholder do captive portal ausente: ${placeholder}`);
    }
}

if (/<a\b[^>]*href\s*=\s*["']#["']/i.test(captivePortal)) {
    errors.push("Existe um link href=\"#\" sem destino.");
}

const config = readFileSync(join(root, "config.js"), "utf8");
const core = readFileSync(join(root, "openwrt/usr/libexec/drinkfornet-core.lua"), "utf8");
if (!/DURATION\s*=\s*1500/.test(core)) {
    errors.push("O núcleo Lua precisa impor exatamente 1500 segundos.");
}
for (const state of ["AVAILABLE", "ACTIVE", "EXPIRED", "REVOKED"]) {
    if (!core.includes(state)) errors.push(`Estado obrigatório ausente no núcleo: ${state}`);
}
if (!/sha256sum/.test(core) || !/urandom/.test(core)) {
    errors.push("O núcleo precisa usar aleatoriedade do sistema e a fronteira sha256sum.");
}
if (!/sessionStorage/.test(readFileSync(join(root, "admin/admin.js"), "utf8"))) {
    errors.push("O painel administrativo precisa manter o token somente na sessão do navegador.");
}
for (const document of ["README.md", "README.en.md", "QUICKSTART.md", "SECURITY.md"]) {
    const content = readFileSync(join(root, document), "utf8");
    if (!/release candidate|release candidate/i.test(content)) {
        errors.push(`${document} precisa marcar o MVP como release candidate.`);
    }
    if (!/Cudy TR1200/.test(content) || !/physical validation|validação física/i.test(content)) {
        errors.push(`${document} precisa declarar a validação física pendente do Cudy TR1200.`);
    }
}
const staleClaims = [
    "Voucher creation, authentication and session expiration still depend on the captive portal",
    "A emissão e a validação de vouchers continuam dependendo",
    "The page does not create the Wi-Fi network, issue vouchers or expire sessions by itself"
];
const allDocs = ["README.md", "README.en.md", "QUICKSTART.md", "SECURITY.md"]
    .map((file) => readFileSync(join(root, file), "utf8")).join("\n");
for (const claim of staleClaims) {
    if (allDocs.includes(claim)) errors.push(`Afirmação obsoleta encontrada: ${claim}`);
}
if (!/accessMinutes:\s*25/.test(config)) errors.push("config.js precisa manter accessMinutes em 25.");
const configuredPhotos = [...config.matchAll(/"([^"]+\.(?:jpg|jpeg|png|webp|avif))"/gi)]
    .map((match) => match[1])
    .filter((photo) => !photo.includes("http"));
for (const photo of configuredPhotos) {
    if (!existsSync(join(root, photo))) {
        errors.push(`Foto configurada ausente: ${photo}`);
    }
}

if (errors.length > 0) {
    console.error("Validação falhou:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log("Validação concluída: arquivos, entradas, placeholders e fotos estão consistentes.");
}
