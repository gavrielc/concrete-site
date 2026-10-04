import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './schemaTypes';
import {structure} from './structure';

export default defineConfig({
    name: 'default',
    title: 'Concrete Media',
    projectId: 'o458gxs0',
    dataset: 'production',
    plugins: [structureTool({structure})],
    schema: {
        types: schemaTypes,
        // Homepage and page texts are fixed documents edited from the menu; don't offer it under "Create new".
        templates: (templates) => templates.filter(({schemaType}) => !['homepage', 'page'].includes(schemaType)),
    },
    document: {
        actions: (actions, {schemaType}) =>
            ['homepage', 'page'].includes(schemaType) ? actions.filter(({action}) => !['delete', 'duplicate', 'unpublish'].includes(action)) : actions,
    },
});
