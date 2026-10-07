// Node module hooks: make `import logo from './x.png'` resolve to {src: <absolute file path>},
// mimicking Astro's image imports so the legacy data files can be loaded in plain Node.
import {fileURLToPath} from 'node:url';

const ASSET = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

export async function load(url, context, nextLoad) {
    if (ASSET.test(url)) {
        const path = fileURLToPath(url);
        return {format: 'module', shortCircuit: true, source: `export default ${JSON.stringify({src: path})};`};
    }
    return nextLoad(url, context);
}
