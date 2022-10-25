cy.SonicJs = {
  getBaseUrl: () => {
    return "http://localhost:3018";
  },

  login: () => {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin`);
    cy.contains('Login',{ timeout: 10000 }).should('be.visible');

    cy.get('#email').type("a@a.com");
    cy.get('[type="password"]').type("tiger44");

    cy.get("#login-submit").click();
  },

  logout: () => {
    cy.get("#logout-button").click({ force: true });
  },

  adminPageVerify: (url, textToVerify) => {
    const fullUrl = `${cy.SonicJs.getBaseUrl()}/${url}`;
    console.log('verify url', fullUrl);
    cy.visit(fullUrl);
    cy.contains(textToVerify);
  },

  frontEndLogin: () => {
    Cypress.on('uncaught:exception', () => false)
    cy.visit(`${cy.SonicJs.getBaseUrl()}/login`);
    cy.contains("Login");

    cy.get('#email').type("LUOjqFCZz1AA3250pCBYAoxV");
    cy.get('[type="password"]').type("LUOjqFCZz1AA3250pCBYAoxV");

    cy.get("#login-submit").click();

  },

  clearCypressTestData: () => {
    cy.request(`${cy.SonicJs.getBaseUrl()}/set-e2e-test-mode`);
    cy.request(`${cy.SonicJs.getBaseUrl()}/clear-test-data`);
  },

  clearCypressTesFlag: () => {
    cy.request(`${cy.SonicJs.getBaseUrl()}/set-e2e-test-mode-off`);
  },

  openPageBuilderPanel: () => {
    cy.get("#sidebar-expander").should("have.class", "collapsed");
    cy.get(".pb-wrapper").should("have.class", "collapsed");
    cy.get("#sidebar-expander").click().click();
    cy.get("#sidebar-expander").should("have.class", "expanded");
    cy.contains("Add Element").should("be.visible");
    cy.contains("Title").should("be.visible");
    cy.contains("Accordian").should("be.visible");  },


};
