/** @type {import("prettier").Config} */
export default {
  trailingComma: 'none',
  singleQuote: true,
  jsxSingleQuote: true,
  overrides: [
    {
      files: ['*.css'],
      options: {
        singleQuote: false
      }
    }
  ]
};
