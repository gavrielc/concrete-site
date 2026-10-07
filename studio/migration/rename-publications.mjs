// Renames publications to their official spelling.
// Run from the studio folder: npx sanity exec migration/rename-publications.mjs --with-user-token
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2025-02-19'});
const renames = {
    TheNewStack: 'The New Stack',
    SiliconAngle: 'SiliconANGLE',
    'Unite.ai': 'Unite.AI',
    SDTimes: 'SD Times',
    FinExtra: 'Finextra',
    'Wall Street Journal': 'The Wall Street Journal',
};
const tx = client.transaction();
for (const [from, to] of Object.entries(renames)) {
    const ids = await client.fetch('*[_type == "publication" && name == $from]._id', {from});
    ids.forEach((id) => tx.patch(id, {set: {name: to}}));
    console.log(`${from} -> ${to} (${ids.length})`);
}
await tx.commit({visibility: 'sync'});
