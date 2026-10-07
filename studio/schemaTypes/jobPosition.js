import {defineArrayMember, defineField, defineType} from 'sanity';
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list';
import {Briefcase} from 'lucide-react';

export const jobPosition = defineType({
    name: 'jobPosition',
    title: 'Open position',
    type: 'document',
    icon: Briefcase,
    orderings: [orderRankOrdering],
    initialValue: {isOpen: true, location: 'Jerusalem - Hybrid', applyEmail: 'careers@concrete.media'},
    fields: [
        defineField({name: 'title', title: 'Job title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'location', title: 'Location', type: 'string', validation: (rule) => rule.required()}),
        defineField({
            name: 'isOpen',
            title: 'Show on website',
            type: 'boolean',
            description: 'Turn off to hide the position without deleting it.',
        }),
        defineField({
            name: 'overview',
            title: 'Role overview',
            type: 'text',
            rows: 5,
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'sections',
            title: 'Description sections',
            type: 'array',
            description: 'For example "What You\'ll Do", each with a list of bullet points.',
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'section',
                    fields: [
                        defineField({name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required()}),
                        defineField({
                            name: 'points',
                            title: 'Bullet points',
                            type: 'array',
                            of: [{type: 'string'}],
                        }),
                    ],
                    preview: {select: {title: 'heading', points: 'points'}, prepare: ({title, points}) => ({title, subtitle: `${points?.length || 0} points`})},
                }),
            ],
        }),
        defineField({
            name: 'applyEmail',
            title: 'Apply email',
            type: 'email',
            description: 'The "Apply now" button opens an email to this address.',
            validation: (rule) => rule.required(),
        }),
        orderRankField({type: 'jobPosition'}),
    ],
    preview: {
        select: {title: 'title', location: 'location', isOpen: 'isOpen'},
        prepare: ({title, location, isOpen}) => ({title, subtitle: [location, isOpen === false ? 'Hidden' : null].filter(Boolean).join(' · ')}),
    },
});
