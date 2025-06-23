import fs from 'fs/promises';
import path from 'path';

export async function generateCollection(name: string, options: { fields?: string }) {
  console.log(`Generating collection: ${name}`);
  
  const collectionName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  
  // Parse fields if provided
  const fields = options.fields ? parseFields(options.fields) : getDefaultFields();
  
  // Generate collection configuration
  const collectionConfig = {
    name: collectionName,
    displayName,
    description: `${displayName} collection`,
    schema: {
      type: 'object',
      properties: fields,
      required: ['title']
    }
  };
  
  // Create collections directory if it doesn't exist
  const collectionsDir = path.join(process.cwd(), 'collections');
  await fs.mkdir(collectionsDir, { recursive: true });
  
  // Write collection file
  const collectionFile = path.join(collectionsDir, `${collectionName}.json`);
  await fs.writeFile(collectionFile, JSON.stringify(collectionConfig, null, 2));
  
  console.log(`✅ Collection created: ${collectionFile}`);
  console.log(`📝 Fields: ${Object.keys(fields).join(', ')}`);
}

function parseFields(fieldsString: string) {
  const fields: Record<string, any> = {};
  
  const fieldPairs = fieldsString.split(',').map(f => f.trim());
  
  for (const fieldPair of fieldPairs) {
    const [name, type = 'string'] = fieldPair.split(':').map(s => s.trim());
    
    fields[name] = {
      type: mapFieldType(type),
      title: name.charAt(0).toUpperCase() + name.slice(1)
    };
  }
  
  return fields;
}

function mapFieldType(type: string) {
  const typeMap: Record<string, string> = {
    'text': 'string',
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'date': 'string', // Will be formatted as date
    'email': 'string',
    'url': 'string',
    'textarea': 'string',
    'richtext': 'string'
  };
  
  return typeMap[type.toLowerCase()] || 'string';
}

function getDefaultFields() {
  return {
    title: {
      type: 'string',
      title: 'Title',
      description: 'The title of the content'
    },
    content: {
      type: 'string',
      title: 'Content',
      description: 'The main content body'
    }
  };
}