// Builds a standalone, printable copy of the editor guide (same content as the Studio Help tab):
//   node help/build-guide.mjs <out.html>
// Images are embedded, so the HTML file works on its own; print it to PDF with any browser.
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {guide} from './guide.js';
import {guideCss, renderGuideHtml} from './render.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || resolve(here, 'editor-guide.html');
const imageSrc = (name) => `data:image/jpeg;base64,${readFileSync(resolve(here, '../static/help', name)).toString('base64')}`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Concrete Media website: editor guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 14mm 12mm; }
  body { margin: 0; background: #f4f2f9; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 32px 20px 48px; }
  .brand { display: flex; align-items: center; gap: 8px; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 18px; margin-bottom: 18px; }
  .brand i { width: 12px; height: 12px; border-radius: 50%; background: #7022fb; display: inline-block; }
  .studio { color: #64748b; font-size: 13px; margin: 0 0 6px; font-family: 'Inter', sans-serif; }
  @media print { body { background: #fff; } .wrap { padding: 0; } }
${guideCss}
</style>
</head>
<body>
<div class="wrap">
  <div class="brand"><i></i>concrete.media</div>
  <p class="studio">Studio: https://concrete-media.sanity.studio</p>
  ${renderGuideHtml(guide, imageSrc)}
</div>
</body>
</html>`;

writeFileSync(out, html);
console.log(`Wrote ${out}`);
