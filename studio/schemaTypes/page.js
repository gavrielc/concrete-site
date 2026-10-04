import {defineArrayMember, defineField, defineType} from 'sanity';
import {icons} from '@sanity/icons';

// One fixed document per website page (IDs like "page-clients"); see structure.js.
// The homepage only has SEO fields here; its other content lives in the "homepage" document.
const isHome = ({document}) => document?._id?.replace(/^drafts\./, '') === 'page-home';
const isContact = ({document}) => document?._id?.replace(/^drafts\./, '') === 'page-contact';
const notJoinUs = ({document}) => document?._id?.replace(/^drafts\./, '') !== 'page-joinUs';

// Extra sections that only exist on the Join Us page.
const joinUsFields = [
    defineField({
        name: 'positionsHeading',
        title: 'Open positions heading',
        type: 'string',
        group: 'joinUs',
        hidden: notJoinUs,
    }),
    defineField({
        name: 'bannerText',
        title: 'Banner text',
        type: 'text',
        rows: 3,
        group: 'joinUs',
        description: 'The large white text over the team photo.',
        hidden: notJoinUs,
    }),
    defineField({
        name: 'bannerImage',
        title: 'Banner photo',
        type: 'image',
        group: 'joinUs',
        description: 'A wide photo works best; the text sits on its left side.',
        hidden: notJoinUs,
    }),
    defineField({
        name: 'benefitsHeading',
        title: '"Stand apart" heading',
        type: 'string',
        group: 'joinUs',
        hidden: notJoinUs,
    }),
    defineField({
        name: 'benefits',
        title: '"Stand apart" cards',
        type: 'array',
        group: 'joinUs',
        description: 'Drag to reorder.',
        hidden: notJoinUs,
        of: [
            defineArrayMember({
                type: 'object',
                name: 'benefit',
                fields: [
                    defineField({name: 'icon', title: 'Icon', type: 'image', description: 'Square icon, ideally SVG.'}),
                    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
                    defineField({name: 'text', title: 'Text', type: 'text', rows: 4, validation: (rule) => rule.required()}),
                ],
                preview: {select: {title: 'title', subtitle: 'text', media: 'icon'}},
            }),
        ],
    }),
    defineField({
        name: 'benefitsButtonLabel',
        title: 'Button label',
        type: 'string',
        group: 'joinUs',
        description: 'The button under the cards (links to the Team page).',
        hidden: notJoinUs,
    }),
];

export const page = defineType({
    name: 'page',
    title: 'Page text',
    type: 'document',
    icon: icons.document,
    groups: [
        {name: 'content', title: 'Page text', default: true},
        {name: 'joinUs', title: 'Join Us sections', hidden: notJoinUs},
        {name: 'seo', title: 'SEO (Google)'},
    ],
    fields: [
        defineField({name: 'label', title: 'Page', type: 'string', readOnly: true, hidden: true}),
        defineField({
            name: 'heading',
            title: 'Heading',
            type: 'string',
            group: 'content',
            description: 'The large purple title at the top of the page.',
            hidden: isHome,
        }),
        defineField({
            name: 'intro',
            title: 'Intro text',
            type: 'array',
            group: 'content',
            description: 'The paragraph under the heading. Select text to make it bold.',
            hidden: (ctx) => isHome(ctx) || isContact(ctx),
            of: [
                defineArrayMember({
                    type: 'block',
                    styles: [{title: 'Normal', value: 'normal'}],
                    lists: [],
                    marks: {decorators: [{title: 'Bold', value: 'strong'}, {title: 'Italic', value: 'em'}], annotations: []},
                }),
            ],
        }),
        ...joinUsFields,
        defineField({
            name: 'seoTitle',
            title: 'SEO title',
            type: 'string',
            group: 'seo',
            description: 'Shown in Google results and the browser tab. Ideally up to 60 characters.',
            validation: (rule) => [rule.required(), rule.max(60).warning('Google usually cuts titles longer than 60 characters.')],
        }),
        defineField({
            name: 'seoDescription',
            title: 'SEO description',
            type: 'text',
            rows: 3,
            group: 'seo',
            description: 'The short text under the title in Google results. Ideally 120–160 characters.',
            validation: (rule) => [rule.required(), rule.max(160).warning('Google usually cuts descriptions longer than 160 characters.')],
        }),
    ],
    preview: {select: {title: 'label', subtitle: 'seoTitle'}},
});
