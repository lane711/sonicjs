const { expect } = require("chai");
const { iteratee } = require("lodash");



describe("Smoke Testing", function () {

  it("login and logout of admin", function () {

    cy.SonicJs.login();
    cy.SonicJs.logout();

  });

});

