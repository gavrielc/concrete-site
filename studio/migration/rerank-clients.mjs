// Gives every client a unique orderRank again, in the original website order
// (clients not in the original list keep their current relative order at the end).
// Run from the studio folder: npx sanity exec migration/rerank-clients.mjs --with-user-token
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getCliClient} from 'sanity/cli';
import {LexoRank} from 'lexorank';

const client = getCliClient({apiVersion: '2025-02-19'});
const here = dirname(fileURLToPath(import.meta.url));
const legacyOrder = JSON.parse(readFileSync(resolve(here, 'legacy-content.json'), 'utf8')).clients.map((c) => c.name);

const clients = await client.fetch('*[_type == "client" && !(_id in path("drafts.**"))] | order(orderRank, _id){_id, name}');
const position = (c) => {
    const i = legacyOrder.indexOf(c.name);
    return i === -1 ? legacyOrder.length + clients.indexOf(c) : i;
};
const ordered = [...clients].sort((a, b) => position(a) - position(b));

let rank = LexoRank.min();
const tx = client.transaction();
for (const c of ordered) {
    rank = rank.genNext().genNext();
    tx.patch(c._id, {set: {orderRank: rank.toString()}});
    // Keep any open draft in step.
    tx.patch(`drafts.${c._id}`, {set: {orderRank: rank.toString()}});
}
await tx.commit({visibility: 'sync'}).catch(async (error) => {
    // Patching a draft that doesn't exist fails; redo with published documents only.
    if (!String(error.message).includes('not found')) throw error;
    let r = LexoRank.min();
    const tx2 = client.transaction();
    ordered.forEach((c) => {
        r = r.genNext().genNext();
        tx2.patch(c._id, {set: {orderRank: r.toString()}});
    });
    await tx2.commit({visibility: 'sync'});
});
const check = await client.fetch('*[_type == "client" && !(_id in path("drafts.**"))] | order(orderRank){name, orderRank}');
const unique = new Set(check.map((c) => c.orderRank)).size;
console.log(`Clients: ${check.length}, unique ranks: ${unique}. First: ${check.slice(0, 5).map((c) => c.name).join(', ')}`);
