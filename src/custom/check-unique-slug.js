const programs = require('./rife-data.json');

// console.log('programs', JSON.stringify(programs, null, 2))

// return;
const testPrograms = programs.slice(0, 10);

// console.log(JSON.stringify(testPrograms, null, 2))

for (const program of testPrograms) {
  const type = program.sweep ? 'sweep' : 'set';
  const slug = convertToSlug(program.title);

  const check = testPrograms.filter((x) => x.title === program.title);

// console.log('checking ' + slug)

  if (check.length > 0) {
    console.log('duplicat --> ', slug);
  }

  // console.log(freq.sweep)
}

function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace('_', '')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}
