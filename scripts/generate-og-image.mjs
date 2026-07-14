#!/usr/bin/env node
//
// Generates public/og-image.png: 1200x630 bone canvas, faint carpet-motif
// texture (same geometry as components/ui/CarpetPattern.tsx), logo centered.
// Re-run this whenever the brand logo changes.
//
// Usage: node scripts/generate-og-image.mjs

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = "#FAF8F4";
// app/globals.css: --accent, same color CarpetPattern's `text-accent` resolves to.
const ACCENT = "#0f6b4f";
const LOGO_HEIGHT = 320;

// Same <pattern> geometry as components/ui/CarpetPattern.tsx, tiled across
// the full canvas instead of a single SVG <pattern> element (sharp/librsvg
// rasterizes a flat SVG more predictably than relying on patternUnits here).
function buildPatternTileSvg() {
  return `
    <g fill="none" stroke="${ACCENT}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M0,18 L15,8 L30,18 L45,8 L60,18 L75,8 L90,18 L105,8 L120,18" />
      <path d="M0,102 L15,112 L30,102 L45,112 L60,102 L75,112 L90,102 L105,112 L120,102" />
      <path d="M60,35 L70,45 L70,50 L78,58 L78,62 L70,70 L70,75 L60,85 L50,75 L50,70 L42,62 L42,58 L50,50 L50,45 Z" />
      <path d="M60,52 L66,60 L60,68 L54,60 Z" />
      <path d="M55,35 L52,35 L52,30" />
      <path d="M65,35 L68,35 L68,30" />
      <path d="M55,85 L52,85 L52,90" />
      <path d="M65,85 L68,85 L68,90" />
    </g>
  `;
}

function buildTexturedBackgroundSvg() {
  const tile = 120;
  const cols = Math.ceil(WIDTH / tile) + 1;
  const rows = Math.ceil(HEIGHT / tile) + 1;

  let tiles = "";
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles += `<g transform="translate(${col * tile},${row * tile})">${buildPatternTileSvg()}</g>`;
    }
  }

  return `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="${BACKGROUND}" />
      <g opacity="0.05">${tiles}</g>
    </svg>
  `;
}

async function main() {
  const textureBuffer = Buffer.from(buildTexturedBackgroundSvg());

  const logoPath = path.join(root, "public/brand/yapinci-logo.png");
  const logoBuffer = await sharp(logoPath)
    .resize({ height: LOGO_HEIGHT })
    .toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();

  const outputPath = path.join(root, "public/og-image.png");

  await sharp(textureBuffer)
    .composite([
      {
        input: logoBuffer,
        left: Math.round((WIDTH - logoMeta.width) / 2),
        top: Math.round((HEIGHT - logoMeta.height) / 2),
      },
    ])
    .png()
    .toFile(outputPath);

  console.log(`Wrote ${outputPath} (${WIDTH}x${HEIGHT})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
