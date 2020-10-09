const { expect } = require("chai");
const { iteratee } = require("lodash");
var common = require("../support/index");


describe("new site", function () {

  before(() => {
    //clear admin user
    //TODO: create an endpoint that resets all data - replace data.json with data.original.json

  })

  // it("login and logout of admin", function () {
  //   login();
  //   logout();
  // });

  it("All admin pages should load", function () {

    login();

    adminPageVerify('./admin', 'Traffic');

    adminPageVerify('./admin/content', 'New Content');

    adminPageVerify('./admin/media', 'New Media');

    adminPageVerify('./admin/field-types', 'New Field Type');

    adminPageVerify('./admin/content-types', 'New Content Type');

    adminPageVerify('./admin/modules', 'New Module');

    adminPageVerify('./admin/theme-settings', 'Edit Theme Settings');

    adminPageVerify('./admin/site-settings-colors', 'Edit Site Colors');

    adminPageVerify('./admin/site-settings-typography', 'Edit Site Typography');

    adminPageVerify('./admin/menus', 'New Menu');

    adminPageVerify('./admin/security-settings', 'Security Settings, Coming soon');

    adminPageVerify('./admin/users', 'New User');

    adminPageVerify('./admin/site-settings', 'Edit Site Settings');

    adminPageVerify('./admin/logs', 'Logs Coming Soon');



    logout();
  });

  it("Content CRUD", function () {

    login();

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
    cy.contains('New Content').click()

    logout();
  });

  function login(){
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin`);
    cy.contains('Login');

    cy.get('[type="email"]').type('a@a.com');
    cy.get('[type="password"]').type('tiger44');

    cy.get('#login-submit').click();
  }

  function logout(){
    cy.get('#logout-button').click({ force: true });
  }

  function adminPageVerify(url, textToVerify){
    cy.visit(`${cy.SonicJs.getBaseUrl()}/${url}`);
    cy.contains(textToVerify);
  }

  // it("register form validation", function () {
  //   cy.visit('http://localhost:3018/');


  //   cy.contains('Create Account').click();

  //   cy.get('[type="email"]').then(($input) => {
  //     expect($input[0].validationMessage).to.eq('I expect an email!')
  //   })

  // });
});

