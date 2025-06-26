
const faqs = [
  {
    question: 'What is SonicJS?',
    answer: 'SonicJS is a next-generation headless CMS built on Cloudflare Workers, Hono, and Drizzle ORM.',
  },
  {
    question: 'How do I get started?',
    answer: 'You can get started by following the instructions in the README.md file.',
  },
  {
      question: 'Where can I find the documentation?',
      answer: 'The documentation is available at /docs.',
  },
  {
      question: 'How can I contribute?',
      answer: 'Contributions are welcome! Please open an issue or submit a pull request on GitHub.',
  }
];

const sql = faqs.map(faq => `INSERT INTO faq (question, answer) VALUES ('${faq.question.replace(/'/g, "''")}','${faq.answer.replace(/'/g, "''")}');`).join('\n');

console.log(sql);
