import {defineField, defineType} from 'sanity';
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list';
import {icons} from '@sanity/icons';
import {logoThumb} from './logoThumb';

export const testimonial = defineType({
    name: 'testimonial',
    title: 'Testimonial',
    type: 'document',
    icon: icons.comment,
    orderings: [orderRankOrdering],
    initialValue: {isVisible: true},
    fields: [
        defineField({
            name: 'quote',
            title: 'Quote',
            type: 'text',
            rows: 6,
            validation: (rule) => rule.required(),
        }),
        defineField({name: 'name', title: 'Person name', type: 'string', validation: (rule) => rule.required()}),
        defineField({
            name: 'title',
            title: 'Role and company',
            type: 'string',
            description: 'For example: Co-founder & CPO of Buildots',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'client',
            title: 'Client',
            type: 'reference',
            to: [{type: 'client'}],
            description: "The client's logo is shown on the card.",
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'logoOverride',
            title: 'Different logo (optional)',
            type: 'image',
            description: "Only if this card should use a different logo than the client's.",
        }),
        defineField({
            name: 'isVisible',
            title: 'Show on website',
            type: 'boolean',
            description: 'Turn off to hide the testimonial without deleting it.',
        }),
        orderRankField({type: 'testimonial'}),
    ],
    preview: {
        select: {
            name: 'name',
            title: 'title',
            isVisible: 'isVisible',
            clientLogo: 'client.logo.asset.url',
            overrideLogo: 'logoOverride.asset.url',
        },
        prepare: ({name, title, isVisible, clientLogo, overrideLogo}) => ({
            title: name,
            subtitle: [title, isVisible === false ? 'Hidden' : null].filter(Boolean).join(' · '),
            media: logoThumb(overrideLogo || clientLogo),
        }),
    },
});
