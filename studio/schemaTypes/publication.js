import {defineField, defineType} from 'sanity';
import {BookOpen} from 'lucide-react';
import {logoThumb} from './logoThumb';

export const publication = defineType({
    name: 'publication',
    title: 'Publication',
    type: 'document',
    icon: BookOpen,
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
