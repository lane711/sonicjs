const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("new site", function () {

  before(() => {
    //clear admin user
    //TODO: create an endpoint that resets all data - replace data.json with data.original.json

  })

  // it("new site should redirect to register page", function () {
  //   cy.visit('http://localhost:3018/');
  //   cy.contains('Register');
  //   cy.contains('Create your admin account');
  // });

  // it("register form validation", function () {
  //   cy.visit('http://localhost:3018/');


  //   cy.contains('Create Account').click();

  //   cy.get('[type="email"]').then(($input) => {
  //     expect($input[0].validationMessage).to.eq('I expect an email!')
  //   })

  // });
});

