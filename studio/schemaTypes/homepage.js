import {defineArrayMember, defineField, defineType} from 'sanity';
import {House} from 'lucide-react';

// Singleton (document ID "homepage"); see structure.js and sanity.config.js.
export const homepage = defineType({
    name: 'homepage',
    title: 'Homepage',
    type: 'document',
    icon: House,
    groups: [
        {name: 'hero', title: 'Top banner', default: true},
        {name: 'clients', title: 'Clients'},
        {name: 'coverage', title: 'Coverage'},
        {name: 'testimonials', title: 'Testimonials'},
        {name: 'joinUs', title: 'Join us'},
        {name: 'seo', title: 'SEO (Google)'},
    ],
    fields: [
        // Top banner
        defineField({
            name: 'heroText',
            title: 'Tagline',
            type: 'text',
            rows: 2,
            group: 'hero',
            description: 'The white text under the logo. Press Enter for a line break.',
        }),
        defineField({
            name: 'heroImage',
            title: 'Background photo',
            type: 'image',
            group: 'hero',
            description: 'Full-screen photo behind the logo (a purple tint is added on top).',
        }),

        // Clients
        defineField({name: 'clientsHeading', title: 'Heading', type: 'string', group: 'clients'}),
        defineField({name: 'clientsButtonLabel', title: 'Button label', type: 'string', group: 'clients', description: 'Links to the Clients page.'}),
        defineField({
            name: 'clientLogos',
            title: 'Client logos',
            type: 'array',
            group: 'clients',
            description: 'Drag to reorder. Best with 6 (two rows of 3).',
            of: [defineArrayMember({type: 'reference', to: [{type: 'client'}]})],
            validation: (rule) => [
                rule.max(6).error('The homepage has room for up to 6 logos.'),
                rule.unique().error('Each client can appear only once.'),
                rule.custom((logos) => (logos?.length === 6 ? true : 'The layout looks best with exactly 6 logos.')).warning(),
            ],
        }),

        // Coverage
        defineField({
            name: 'coverageItems',
            title: 'Coverage cards',
            type: 'array',
            group: 'coverage',
            description: 'The coverage cards on the homepage. Drag to reorder. Best with 4.',
            of: [defineArrayMember({type: 'reference', to: [{type: 'coverage'}], options: {filter: 'kind == "article"'}})],
            validation: (rule) => [
                rule.max(4).error('The homepage has room for up to 4 coverage cards.'),
                rule.unique().error('Each article can appear only once.'),
                rule.custom((items) => (items?.length === 4 ? true : 'The layout looks best with exactly 4 cards.')).warning(),
            ],
        }),
        defineField({name: 'coverageHeading', title: 'Heading', type: 'string', group: 'coverage'}),
        defineField({name: 'coverageText', title: 'Text', type: 'text', rows: 3, group: 'coverage'}),
        defineField({
            name: 'coverageButtonLabel',
            title: 'Button label',
            type: 'string',
            group: 'coverage',
            description: 'Links to the Coverage page.',
        }),

        // Testimonials
        defineField({
            name: 'testimonialsHeading',
            title: 'Heading',
            type: 'string',
            group: 'testimonials',
            description: 'Also used above the testimonials on the Clients page.',
        }),

        // Join us
        defineField({name: 'joinUsImage', title: 'Photo', type: 'image', group: 'joinUs'}),
        defineField({
            name: 'joinUsImageAlt',
            title: 'Photo description',
            type: 'string',
            group: 'joinUs',
            description: 'Describes the photo for screen readers and Google.',
        }),
        defineField({name: 'joinUsHeading', title: 'Heading', type: 'string', group: 'joinUs'}),
        defineField({name: 'joinUsText', title: 'Text', type: 'text', rows: 3, group: 'joinUs'}),
        defineField({name: 'joinUsButtonLabel', title: 'Button label', type: 'string', group: 'joinUs', description: 'Links to the Join Us page.'}),

        // SEO
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
    preview: {prepare: () => ({title: 'Homepage'})},
});
