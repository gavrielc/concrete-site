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
        // The homepage is a single document edited from the menu; don't offer it under "Create new".
        templates: (templates) => templates.filter(({schemaType}) => schemaType !== 'homepage'),
    },
    document: {
        actions: (actions, {schemaType}) =>
            schemaType === 'homepage' ? actions.filter(({action}) => !['delete', 'duplicate', 'unpublish'].includes(action)) : actions,
    },
});
