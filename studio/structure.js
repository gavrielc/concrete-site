import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list';
import {icons} from '@sanity/icons';

const {users: UsersIcon, tags: TagsIcon, 'document-text': DocumentTextIcon, book: BookIcon} = icons;

export const structure = (S, context) =>
    S.list()
        .title('Content')
        .items([
            S.listItem()
                .title('Coverage (Results)')
                .icon(DocumentTextIcon)
                .child(
                    S.documentTypeList('coverage')
                        .title('Coverage (Results)')
                        .defaultOrdering([{field: 'date', direction: 'desc'}])
                ),
            S.listItem()
                .title('Publications')
                .icon(BookIcon)
                .child(
                    S.documentTypeList('publication')
                        .title('Publications')
                        .defaultOrdering([{field: 'name', direction: 'asc'}])
                ),
            S.divider(),
            orderableDocumentListDeskItem({type: 'client', title: 'Clients', icon: TagsIcon, S, context}),
            orderableDocumentListDeskItem({type: 'teamMember', title: 'Team', icon: UsersIcon, S, context}),
        ]);
