const { expect } = require("chai");
const { iteratee } = require("lodash");



describe("Smoke Testing", function () {

  it("login cookie expiration should redirect to login", function () {

    cy.SonicJs.login();
    cy.clearCookies();
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
    cy.contains('Login')

  });

});

