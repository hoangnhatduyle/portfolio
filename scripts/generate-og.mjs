// Renders public/og.png (1200x630 social preview) from the real portrait and site fonts.
// Usage: node scripts/generate-og.mjs
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const font = (pkg, file) =>
  pathToFileURL(join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).href;
const portrait = readFileSync(join(root, 'src/assets/profile.jpg')).toString('base64');
const profile = JSON.parse(readFileSync(join(root, 'src/content/profile.json'), 'utf8'));

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:R;src:url(${font('raleway', 'raleway-latin-wght-normal.woff2')});font-weight:100 900}
@font-face{font-family:I;src:url(${font('inter', 'inter-latin-wght-normal.woff2')});font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#17181c;color:#fff;font-family:I;position:relative;overflow:hidden}
.photo{position:absolute;right:0;top:0;width:640px;height:630px;background:url(data:image/jpeg;base64,${portrait}) 50% 18%/cover;
-webkit-mask-image:linear-gradient(to right,transparent 0,#000 45%)}
.copy{position:absolute;left:72px;top:0;bottom:0;width:680px;display:flex;flex-direction:column;justify-content:center;gap:26px}
.eyebrow{font-size:21px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#ff6b7d}
h1{font-family:R;font-weight:700;font-size:84px;line-height:1.02;letter-spacing:-.02em}
h1 span{color:#ff6b7d}
.avail{border-left:5px solid #c8102e;padding-left:20px;font-size:26px;font-weight:500;line-height:1.45}
.name{position:absolute;left:72px;bottom:44px;font-family:R;font-size:28px;font-weight:600;color:#ffffffb8}
.bar{position:absolute;left:0;right:0;bottom:0;height:8px;background:#c8102e}
</style>
<div class="photo"></div>
<div class="copy">
<p class="eyebrow">M.S. Computer Science · University of Cincinnati</p>
<h1>${profile.headline} <span>${profile.headlineAccent}</span></h1>
<p class="avail">${profile.availability.research}<br>${profile.availability.fullTime}</p>
</div>
<p class="name">${profile.name}</p><div class="bar"></div>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
const page_file = join(dir, 'og.html');
writeFileSync(page_file, html);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(pathToFileURL(page_file).href);
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: 'png' });
  await sharp(shot)
    .png({ palette: true, quality: 85, compressionLevel: 9 })
    .toFile(join(root, 'public/og.png'));
  console.log('wrote public/og.png');
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
