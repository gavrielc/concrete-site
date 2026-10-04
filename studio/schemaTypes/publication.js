import {defineField, defineType} from 'sanity';
import {icons} from '@sanity/icons';
import {logoThumb} from './logoThumb';

export const publication = defineType({
    name: 'publication',
    title: 'Publication',
    type: 'document',
    icon: icons.book,
    fields: [
        defineField({name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
        defineField({
            name: 'logo',
            title: 'Logo',
            type: 'image',
            description: 'Shown on every coverage card from this publication.',
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {title: 'name', logoUrl: 'logo.asset.url'},
        prepare: ({title, logoUrl}) => ({title, media: logoThumb(logoUrl)}),
    },
});
