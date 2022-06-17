const { expect } = require("chai");
const { iteratee } = require("lodash");



describe("Login Logout Admin", function () {

  it("login and logout of admin", function () {

    cy.SonicJs.login();
    cy.SonicJs.logout();

  });

});

