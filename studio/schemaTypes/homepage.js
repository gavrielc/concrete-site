import {defineArrayMember, defineField, defineType} from 'sanity';
import {icons} from '@sanity/icons';

// Singleton (document ID "homepage"); see structure.js and sanity.config.js.
export const homepage = defineType({
    name: 'homepage',
    title: 'Homepage',
    type: 'document',
    icon: icons.home,
    fields: [
        defineField({
            name: 'clientLogos',
            title: 'Client logos',
            type: 'array',
            description: 'The client logos next to "The most dynamic tech companies…". Drag to reorder. Best with 6 (two rows of 3).',
            of: [defineArrayMember({type: 'reference', to: [{type: 'client'}]})],
            validation: (rule) => [
                rule.max(6).error('The homepage has room for up to 6 logos.'),
                rule.unique().error('Each client can appear only once.'),
                rule.custom((logos) => (logos?.length === 6 ? true : 'The layout looks best with exactly 6 logos.')).warning(),
            ],
        }),
    ],
    preview: {prepare: () => ({title: 'Homepage'})},
});
