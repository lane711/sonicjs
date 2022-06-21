const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'i5b2ve',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  }
});
