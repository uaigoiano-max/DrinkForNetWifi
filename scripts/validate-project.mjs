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
    "foto-3.jpg"
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

