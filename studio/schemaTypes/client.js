import {defineField, defineType} from 'sanity';
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list';
import {Building2} from 'lucide-react';
import {logoThumb} from './logoThumb';
import {clientCategories} from './options';

export const client = defineType({
    name: 'client',
    title: 'Client',
    type: 'document',
    icon: Building2,
    orderings: [orderRankOrdering],
    fields: [
        defineField({name: 'name', title: 'Company name', type: 'string', validation: (rule) => rule.required()}),
        defineField({
            name: 'logo',
            title: 'Logo',
            type: 'image',
            description: 'Prefer SVG, or PNG with a transparent background.',
            validation: (rule) => rule.required(),
        }),
        defineField({name: 'website', title: 'Website', type: 'url', validation: (rule) => rule.required()}),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{type: 'string'}],
            options: {list: clientCategories},
            description: 'Used by the filter buttons on the Clients page.',
        }),
        defineField({
            name: 'logoStyle',
            title: 'Logo display adjustment',
            type: 'string',
            description: 'Only needed if the logo looks too small or is white.',
            options: {
                list: [
                    {title: 'Extra wide (203px)', value: 'factify-logo'},
                    {title: 'Wide (160px)', value: 'echo-logo'},
                    {title: 'Invert colors (for white logos)', value: 'invert-logo'},
                ],
            },
        }),
        orderRankField({type: 'client'}),
    ],
    preview: {
        select: {title: 'name', subtitle: 'website', logoUrl: 'logo.asset.url'},
        prepare: ({title, subtitle, logoUrl}) => ({title, subtitle, media: logoThumb(logoUrl)}),
    },
});
