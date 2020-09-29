const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("new site", function () {
  it("new site should redirect to register page", function () {
    cy.visit('http://localhost:3018/');
    cy.contains('Register');
    cy.contains('Create your admin account');
  });

  it("register admin account", function () {
    cy.visit('http://localhost:3018/');


    cy.contains('Create Account').click();
  });
});
