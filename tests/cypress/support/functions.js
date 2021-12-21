cy.SonicJs = {
  getBaseUrl: () => {
    return "http://localhost:3018";
  },

  login: () => {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin`);
    cy.contains("Login");

    cy.get('[type="email"]').type("a@a.com");
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

};
