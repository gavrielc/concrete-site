import {defineField, defineType} from 'sanity';
import {Newspaper} from 'lucide-react';
import {UrlAutofillInput} from '../components/UrlAutofillInput';
import {logoThumb} from './logoThumb';
import {coverageCategories} from './options';

const isPodcast = ({document}) => document?.kind === 'podcast';
const isArticle = ({document}) => document?.kind !== 'podcast';

// Required only when the field is visible for the selected type.
const requiredFor = (check) => (rule) =>
    rule.custom((value, context) => (check(context) && !value ? 'Required' : true));

export const coverage = defineType({
    name: 'coverage',
    title: 'Coverage',
    type: 'document',
    icon: Newspaper,
    initialValue: {kind: 'article'},
    fields: [
        defineField({
            name: 'kind',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    {title: 'Article', value: 'article'},
                    {title: 'Podcast episode', value: 'podcast'},
                ],
                layout: 'radio',
                direction: 'horizontal',
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'url',
            title: 'Link',
            type: 'url',
            description: 'Link to the article or episode. Paste it first, then use the button to fill in the details.',
            components: {input: UrlAutofillInput},
            validation: (rule) => [
                rule.required(),
                // Warn when the same link is already in Coverage (ignoring http/https, www. and a trailing slash).
                rule
                    .custom(async (url, context) => {
                        if (!url) return true;
                        const linkKey = (link) => link.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                        const id = context.document._id.replace(/^drafts\./, '');
                        const others = await context
                            .getClient({apiVersion: '2025-02-19'})
                            .fetch('*[_type == "coverage" && !(_id in [$id, "drafts." + $id]) && defined(url)]{url, headline, title}', {id});
                        const twin = others.find((o) => linkKey(o.url) === linkKey(url));
                        return twin ? `This link is already in Coverage: "${twin.headline || twin.title || 'untitled'}"` : true;
                    })
                    .warning(),
            ],
        }),
        defineField({
            name: 'date',
            title: 'Publish date',
            type: 'date',
            options: {dateFormat: 'MMMM D, YYYY'},
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{type: 'string'}],
            options: {list: coverageCategories},
            description: 'Choose "Highlights" or "Podcasts" to show it on the Coverage page tabs.',
        }),

        // Article fields
        defineField({
            name: 'headline',
            title: 'Headline',
            type: 'string',
            hidden: (ctx) => !isArticle(ctx),
            validation: requiredFor(isArticle),
        }),
        defineField({
            name: 'publication',
            title: 'Publication',
            type: 'reference',
            to: [{type: 'publication'}],
            description: 'Not in the list? Use "Create new" to add the publication and its logo.',
            hidden: (ctx) => !isArticle(ctx),
            validation: requiredFor(isArticle),
        }),

        // Podcast fields
        defineField({
            name: 'title',
            title: 'Episode title',
            type: 'string',
            hidden: (ctx) => !isPodcast(ctx),
            validation: requiredFor(isPodcast),
        }),
        defineField({
            name: 'show',
            title: 'Show name',
            type: 'string',
            hidden: (ctx) => !isPodcast(ctx),
            validation: requiredFor(isPodcast),
        }),
        defineField({
            name: 'duration',
            title: 'Duration',
            type: 'string',
            description: 'For example: 42m or 1h 5m',
            hidden: (ctx) => !isPodcast(ctx),
        }),
        defineField({
            name: 'artwork',
            title: 'Show artwork',
            type: 'image',
            hidden: (ctx) => !isPodcast(ctx),
        }),
        defineField({
            name: 'artworkUrl',
            title: 'Artwork URL (imported)',
            type: 'url',
            description: 'Imported from the old site. An uploaded artwork image takes priority.',
            readOnly: true,
            hidden: ({document}) => !isPodcast({document}) || !document?.artworkUrl,
        }),

        // Keeps the original order of imported items that share a date.
        defineField({name: 'legacyOrder', type: 'number', hidden: true, readOnly: true}),
    ],
    orderings: [{title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
    preview: {
        select: {
            kind: 'kind',
            headline: 'headline',
            title: 'title',
            show: 'show',
            publication: 'publication.name',
            date: 'date',
            logoUrl: 'publication.logo.asset.url',
            artwork: 'artwork',
        },
        prepare({kind, headline, title, show, publication, date, logoUrl, artwork}) {
            const podcast = kind === 'podcast';
            return {
                title: (podcast ? title : headline) || '(untitled)',
                subtitle: [podcast ? `Podcast: ${show || ''}` : publication, date]
                    .filter(Boolean)
                    .join(' · '),
                media: podcast ? artwork : logoThumb(logoUrl),
            };
        },
    },
});
