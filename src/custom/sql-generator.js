#!/usr/bin/env node

const programs  = require('./rife-data.json');

const testPrograms = programs.slice(0, 9999);

console.log('delete from programs;');

for (const program of testPrograms) {

  const id = uuidv4();
  const type = program.sweep ? 'sweep' : 'set';

const sql = `insert into programs(id, type, title, description, source, frequencies, sort)
 values ('${id}','${type}',"${program.title}","${program.description}",'${program.source}','${program.frequencies}',10);`

  console.log(sql);


// console.log(freq.sweep)
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// id: text('id').primaryKey(),
// type: integer('type'),
// title: text('title'),
// description: text('description'),
// source: text('source'),
// frequencies: text('frequencies', { mode: 'json' }),
// tags: text('tags', { mode: 'json' }).$type<string[]>(),
// sort: integer('sort').default(10),
// userId: text('userId'),

// wrangler d1 execute sonicjs  --command "SELECT count(*) FROM programs"
// wrangler d1 execute sonicjs --remote  --command "SELECT count(*) FROM programs"

// wrangler d1 execute sonicjs --remote --command "SELECT * FROM users LIMIT 100;"



