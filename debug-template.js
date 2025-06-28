const { TemplateRenderer } = require('./dist/src/utils/template-renderer.js');

const renderer = new TemplateRenderer();

// Test 1: @first and @last
console.log('=== Test 1: @first and @last ===');
const template1 = '{{#each items}}{{#if @first}}START: {{/if}}{{name}}{{#if @last}} :END{{/if}} {{/each}}';
const data1 = {
  items: [
    { name: 'Alpha' },
    { name: 'Beta' },
    { name: 'Gamma' }
  ]
};
const result1 = renderer.render(template1, data1);
console.log('Template:', template1);
console.log('Expected:', 'START: Alpha Beta Gamma :END ');
console.log('Actual  :', result1);

// Test 2: Nested arrays
console.log('\n=== Test 2: Nested arrays ===');
const template2 = '{{#each categories}}{{name}}: {{#each items}}{{.}} {{/each}}{{/each}}';
const data2 = {
  categories: [
    { name: 'Fruits', items: ['Apple', 'Banana'] },
    { name: 'Colors', items: ['Red', 'Blue'] }
  ]
};
const result2 = renderer.render(template2, data2);
console.log('Template:', template2);
console.log('Expected:', 'Fruits: Apple Banana Colors: Red Blue ');
console.log('Actual  :', result2);

// Test 3: Simple debugging
console.log('\n=== Test 3: Simple @first test ===');
const template3 = '{{#each items}}{{@first}} {{/each}}';
const result3 = renderer.render(template3, data1);
console.log('Template:', template3);
console.log('Result  :', result3);

// Test 4: Simple {{.}} test
console.log('\n=== Test 4: Simple {{.}} test ===');
const template4 = '{{#each items}}{{.}} {{/each}}';
const data4 = { items: ['Apple', 'Banana'] };
const result4 = renderer.render(template4, data4);
console.log('Template:', template4);
console.log('Result  :', result4);