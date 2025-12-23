// Handler generator for WorldAnvil MCP
const resources = [
  { name: 'notebook', parent: 'world_id', idParam: 'notebook_id' },
  { name: 'notesection', parent: 'notebook_id', idParam: 'notesection_id' },
  { name: 'note', parent: 'notesection_id', idParam: 'note_id' },
  { name: 'secret', parent: 'world_id', idParam: 'secret_id' },
  { name: 'map', parent: 'world_id', idParam: 'map_id' },
  { name: 'marker', parent: 'map_id', idParam: 'marker_id' },
  { name: 'timeline', parent: 'world_id', idParam: 'timeline_id' },
  { name: 'history', parent: 'world_id', idParam: 'history_id' }
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateHandlers(resource) {
  const methodName = resource.name;
  const pluralName = methodName + 's';
  if (methodName === 'history') pluralName = 'histories';

  return `
      case 'worldanvil_get_${methodName}': {
        const result = await client.get${capitalize(methodName)}(args.${resource.idParam});
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'worldanvil_list_${pluralName}': {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;
        const result = await client.list${capitalize(methodName)}s(args.${resource.parent}, options);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'worldanvil_create_${methodName}': {
        const data = { title: args.title, ${resource.parent}: args.${resource.parent} };
        if (args.content !== undefined) data.content = args.content;
        const result = await client.create${capitalize(methodName)}(data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'worldanvil_update_${methodName}': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined) data.content = args.content;
        const result = await client.update${capitalize(methodName)}(args.${resource.idParam}, data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'worldanvil_delete_${methodName}': {
        const result = await client.delete${capitalize(methodName)}(args.${resource.idParam});
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }`;
}

console.log('// Generated handlers - add before default case\n');
resources.forEach(resource => {
  console.log(generateHandlers(resource));
});

// RPG Systems
console.log(`
      case 'worldanvil_get_rpgsystem': {
        const result = await client.getRpgSystem(args.rpgsystem_id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'worldanvil_list_rpgsystems': {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;
        const result = await client.listRpgSystems(options);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }`);
