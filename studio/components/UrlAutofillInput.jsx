import {useState} from 'react';
import {PatchEvent, set, useClient, useFormCallbacks, useFormValue} from 'sanity';
import {Button, Card, Flex, Stack, Text} from '@sanity/ui';
import {Sparkles} from 'lucide-react';
import {SITE_URL} from '../siteUrl';

const normalize = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^the/, '');

// The coverage "Link" field, plus a button that reads the link and fills in the other fields.
// Only empty fields are filled, so nothing the editor typed is overwritten.
export function UrlAutofillInput(props) {
    const client = useClient({apiVersion: '2025-02-19'});
    const {onChange} = useFormCallbacks();
    const doc = useFormValue([]) || {};
    const [status, setStatus] = useState(null);
    const [busy, setBusy] = useState(false);

    async function fill() {
        setBusy(true);
        setStatus(null);
        try {
            const response = await fetch(`${SITE_URL}.netlify/functions/link-info?url=${encodeURIComponent(props.value)}`);
            const info = await response.json();
            if (!response.ok) throw new Error(info.error || 'Something went wrong.');

            const patches = [];
            const filled = [];
            const fillIfEmpty = (field, value, label) => {
                if (value && !doc[field]) {
                    patches.push(set(value, [field]));
                    filled.push(label);
                }
            };

            if (info.kind && info.kind !== doc.kind) patches.push(set(info.kind, ['kind']));
            fillIfEmpty('date', info.date, 'date');
            let note = info.warning;

            if (info.kind === 'podcast') {
                fillIfEmpty('title', info.title, 'episode title');
                fillIfEmpty('show', info.show, 'show name');
                fillIfEmpty('duration', info.duration, 'duration');
                if (!(doc.categories || []).includes('podcasts')) patches.push(set([...(doc.categories || []), 'podcasts'], ['categories']));
                if (info.artwork && !doc.artwork) {
                    const image = await fetch(`${SITE_URL}.netlify/functions/link-info?image=${encodeURIComponent(info.artwork)}`);
                    if (image.ok) {
                        const asset = await client.assets.upload('image', await image.blob(), {filename: 'podcast-artwork.jpg'});
                        patches.push(set({_type: 'image', asset: {_type: 'reference', _ref: asset._id}}, ['artwork']));
                        filled.push('artwork');
                    }
                }
            } else {
                fillIfEmpty('headline', info.headline, 'headline');
                if (info.publication && !doc.publication) {
                    const publications = await client.fetch('*[_type == "publication" && !(_id in path("drafts.**"))]{_id, name}');
                    const match = publications.find((p) => normalize(p.name) === normalize(info.publication));
                    if (match) {
                        patches.push(set({_type: 'reference', _ref: match._id}, ['publication']));
                        filled.push(`publication (${match.name})`);
                    } else {
                        note = `${note ? `${note} ` : ''}"${info.publication}" is not in Publications yet — pick it or use "Create new".`;
                    }
                }
            }

            if (patches.length) onChange(PatchEvent.from(patches));
            setStatus({
                tone: note ? 'caution' : 'positive',
                text: [filled.length ? `Filled in: ${filled.join(', ')}.` : 'Nothing new to fill in (fields that already have a value are kept).', note]
                    .filter(Boolean)
                    .join(' '),
            });
        } catch (error) {
            setStatus({tone: 'critical', text: error.message});
        } finally {
            setBusy(false);
        }
    }

    return (
        <Stack gap={3}>
            {props.renderDefault(props)}
            <Flex>
                <Button
                    mode="ghost"
                    tone="primary"
                    icon={Sparkles}
                    text={busy ? 'Reading the link…' : 'Fill in details from this link'}
                    disabled={!props.value || busy}
                    onClick={fill}
                />
            </Flex>
            {status && (
                <Card padding={3} radius={2} tone={status.tone}>
                    <Text size={1}>{status.text}</Text>
                </Card>
            )}
        </Stack>
    );
}
