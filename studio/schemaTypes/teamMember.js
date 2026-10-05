import {defineField, defineType} from 'sanity';
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list';
import {UserRound} from 'lucide-react';

export const teamMember = defineType({
    name: 'teamMember',
    title: 'Team member',
    type: 'document',
    icon: UserRound,
    orderings: [orderRankOrdering],
    fields: [
        defineField({name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'title', title: 'Role', type: 'string', validation: (rule) => rule.required()}),
        defineField({
            name: 'photo',
            title: 'Photo',
            type: 'image',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'text',
            rows: 8,
            description: 'Leave an empty line between paragraphs.',
        }),
        defineField({name: 'linkedin', title: 'LinkedIn URL', type: 'url'}),
        defineField({name: 'twitter', title: 'X / Twitter URL', type: 'url'}),
        orderRankField({type: 'teamMember'}),
    ],
    preview: {select: {title: 'name', subtitle: 'title', media: 'photo'}},
});
