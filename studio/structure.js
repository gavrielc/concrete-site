import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list';
import {icons} from '@sanity/icons';

const {
    users: UsersIcon,
    tags: TagsIcon,
    'document-text': DocumentTextIcon,
    book: BookIcon,
    case: CaseIcon,
    home: HomeIcon,
} = icons;

export const structure = (S, context) =>
    S.list()
        .title('Content')
        .items([
            S.listItem()
                .title('Homepage coverage')
                .icon(HomeIcon)
                .child(
                    // The homepage shows the 4 newest of these, so the top 4 of this list are live.
                    S.documentList()
                        .title('On homepage (top 4 are shown)')
                        .schemaType('coverage')
                        .filter('_type == "coverage" && showOnHomepage == true')
                        .defaultOrdering([{field: 'date', direction: 'desc'}])
                ),
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
            orderableDocumentListDeskItem({type: 'jobPosition', title: 'Open positions', icon: CaseIcon, S, context}),
        ]);
