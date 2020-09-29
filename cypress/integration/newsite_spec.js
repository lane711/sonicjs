const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("new site", function () {

  before(() => {
    //clear admin user
  })

  it("new site should redirect to register page", function () {
    cy.visit('http://localhost:3018/');
    cy.contains('Register');
    cy.contains('Create your admin account');
  });

  it("register form validation", function () {
    cy.visit('http://localhost:3018/');


    cy.contains('Create Account').click();

    cy.get('[type="email"]').then(($input) => {
      expect($input[0].validationMessage).to.eq('I expect an email!')
    })

  });
});
