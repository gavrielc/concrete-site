// Reads the content that is currently hard-coded in the Astro site and writes it to legacy-content.json.
// Run from the studio folder: node --import ./migration/register-assets.mjs migration/export-legacy.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname, relative, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../src');

// Evaluate a `const name = [...]` array literal from a source file, binding its image imports to file paths.
function extractArray(file, name) {
    const code = readFileSync(file, 'utf8');
    const imports = {};
    for (const [, id, rel] of code.matchAll(/import\s+(\w+)\s+from\s+["']([^"']+\.(?:png|jpe?g|webp|gif|svg|avif))["']/gi)) {
        imports[id] = {src: resolve(dirname(file), rel)};
    }
    const start = code.indexOf(`const ${name} = [`);
    if (start < 0) throw new Error(`${name} not found in ${file}`);
    let depth = 0, i = code.indexOf('[', start), end = -1;
    for (; i < code.length; i++) {
        if (code[i] === '[') depth++;
        if (code[i] === ']' && --depth === 0) { end = i + 1; break; }
    }
    const literal = code.slice(code.indexOf('[', start), end);
    return new Function(...Object.keys(imports), `return ${literal};`)(...Object.values(imports));
}

const {default: results} = await import(pathToFileURL(resolve(src, 'components/results/data/index.js')));
const clients = extractArray(resolve(src, 'components/Clients.jsx'), 'clients');
const team = extractArray(resolve(src, 'pages/team.astro'), 'team');
const homepage = extractArray(resolve(src, 'pages/index.astro'), 'results');

// Store image paths relative to the repo root so the JSON is portable.
const repoRoot = resolve(here, '../..');
const toRelative = (key, value) =>
    key === 'src' && typeof value === 'string' ? relative(repoRoot, value).split(sep).join('/') : value;

const out = {results, clients, team, homepage};
writeFileSync(resolve(here, 'legacy-content.json'), JSON.stringify(out, toRelative, 2));
console.log(`results: ${results.length}, clients: ${clients.length}, team: ${team.length}, homepage: ${homepage.length}`);
