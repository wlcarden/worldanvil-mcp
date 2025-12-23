// Tool definition generator for WorldAnvil MCP
// Generates consistent tool definitions for all resource types

const resources = [
  {
    name: 'notebook',
    singular: 'notebook',
    plural: 'notebooks',
    parent: 'world',
    parentParam: 'world_id',
    description: 'Campaign notebook/journal'
  },
  {
    name: 'notesection',
    singular: 'notesection',
    plural: 'notesections',
    parent: 'notebook',
    parentParam: 'notebook_id',
    description: 'Section within a notebook'
  },
  {
    name: 'note',
    singular: 'note',
    plural: 'notes',
    parent: 'notesection',
    parentParam: 'notesection_id',
    description: 'Individual session note'
  },
  {
    name: 'secret',
    singular: 'secret',
    plural: 'secrets',
    parent: 'world',
    parentParam: 'world_id',
    description: 'GM-only secret information'
  },
  {
    name: 'map',
    singular: 'map',
    plural: 'maps',
    parent: 'world',
    parentParam: 'world_id',
    description: 'Interactive world map'
  },
  {
    name: 'marker',
    singular: 'marker',
    plural: 'markers',
    parent: 'map',
    parentParam: 'map_id',
    description: 'Marker on a map'
  },
  {
    name: 'timeline',
    singular: 'timeline',
    plural: 'timelines',
    parent: 'world',
    parentParam: 'world_id',
    description: 'Historical timeline'
  },
  {
    name: 'history',
    singular: 'history',
    plural: 'histories',
    parent: 'world',
    parentParam: 'world_id',
    description: 'Historical event/timeline entry'
  }
];

function generateToolDefinition(resource) {
  const idParam = `${resource.singular}_id`;

  return `
      // ${resource.description.toUpperCase()}
      {
        name: 'worldanvil_get_${resource.singular}',
        description: 'Get a specific ${resource.description} by ID',
        inputSchema: {
          type: 'object',
          properties: {
            ${idParam}: {
              type: 'string',
              description: 'The ID of the ${resource.singular} to retrieve',
            },
          },
          required: ['${idParam}'],
        },
      },
      {
        name: 'worldanvil_list_${resource.plural}',
        description: 'List ${resource.plural} in a ${resource.parent}',
        inputSchema: {
          type: 'object',
          properties: {
            ${resource.parentParam}: {
              type: 'string',
              description: 'The ID of the ${resource.parent} to list ${resource.plural} from',
            },
            offset: {
              type: 'number',
              description: 'Pagination offset (optional)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of ${resource.plural} to return (optional)',
            },
          },
          required: ['${resource.parentParam}'],
        },
      },
      {
        name: 'worldanvil_create_${resource.singular}',
        description: 'Create a new ${resource.description}',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the ${resource.singular}',
            },
            ${resource.parentParam}: {
              type: 'string',
              description: 'The ID of the ${resource.parent} to create the ${resource.singular} in',
            },
            content: {
              type: 'string',
              description: 'The content of the ${resource.singular} (optional)',
            },
          },
          required: ['title', '${resource.parentParam}'],
        },
      },
      {
        name: 'worldanvil_update_${resource.singular}',
        description: 'Update an existing ${resource.description}',
        inputSchema: {
          type: 'object',
          properties: {
            ${idParam}: {
              type: 'string',
              description: 'The ID of the ${resource.singular} to update',
            },
            title: {
              type: 'string',
              description: 'The new title (optional)',
            },
            content: {
              type: 'string',
              description: 'The new content (optional)',
            },
          },
          required: ['${idParam}'],
        },
      },
      {
        name: 'worldanvil_delete_${resource.singular}',
        description: 'Delete a ${resource.description}',
        inputSchema: {
          type: 'object',
          properties: {
            ${idParam}: {
              type: 'string',
              description: 'The ID of the ${resource.singular} to delete',
            },
          },
          required: ['${idParam}'],
        },
      },`;
}

// Generate all tool definitions
console.log('// Generated tool definitions - add these to the tools array in index.js\n');
resources.forEach(resource => {
  console.log(generateToolDefinition(resource));
});

// Add RPG Systems
console.log(`
      // RPG SYSTEMS
      {
        name: 'worldanvil_get_rpgsystem',
        description: 'Get a specific RPG system by ID',
        inputSchema: {
          type: 'object',
          properties: {
            rpgsystem_id: {
              type: 'string',
              description: 'The ID of the RPG system to retrieve',
            },
          },
          required: ['rpgsystem_id'],
        },
      },
      {
        name: 'worldanvil_list_rpgsystems',
        description: 'List all available RPG systems',
        inputSchema: {
          type: 'object',
          properties: {
            offset: {
              type: 'number',
              description: 'Pagination offset (optional)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of systems to return (optional)',
            },
          },
        },
      },`);
