const { expect } = require("chai");
const { iteratee } = require("lodash");



describe("Smoke Testing", function () {

  beforeEach(() => {
    login();
  })

  after(() => {
    // logout();
  })

  // it("login and logout of admin", function () {
  //   return;
  //   login();
  //   logout();
  // });

//   it("All admin pages should load", function () {
// return;

//     adminPageVerify('./admin', 'Traffic');

//     adminPageVerify('./admin/content', 'New Content');

//     adminPageVerify('./admin/media', 'New Media');

//     adminPageVerify('./admin/field-types', 'New Field Type');

//     adminPageVerify('./admin/content-types', 'New Content Type');

//     adminPageVerify('./admin/modules', 'New Module');

//     adminPageVerify('./admin/theme-settings', 'Edit Theme Settings');

//     adminPageVerify('./admin/site-settings-colors', 'Edit Site Colors');

//     adminPageVerify('./admin/site-settings-typography', 'Edit Site Typography');

//     adminPageVerify('./admin/menus', 'New Menu');

//     adminPageVerify('./admin/security-settings', 'Security Settings, Coming soon');

//     adminPageVerify('./admin/users', 'New User');

//     adminPageVerify('./admin/site-settings', 'Edit Site Settings');

//     adminPageVerify('./admin/logs', 'Logs Coming Soon');

//   });

  // it("Content create", function () {

  //   cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
  //   cy.contains('New Content').click();
  //   cy.contains('Page').click();
  //   cy.get('input[name="data[title]"]').type('Cypress Test Page');
  //   cy.get('input[name="data[url]').should('have.value', '/cypress-test-page');
  //   cy.get('input[name="data[heroTitle]"]').type('Cypress Hero');
  //   cy.get('input[name="data[pageCssClass]"]').type('Cypress Hero');
  //   cy.get('input[name="data[metaTitle]"]').type('Cypress Meta Title');
  //   cy.get('textarea[name="data[metaDescription]"]').type('Cypress Meta Description');
  //   cy.contains('Submit').click();

  //   cy.contains('Cypress Hero');
  //   cy.url().should('include', '/cypress-test-page');

  // });

  it("Content delete", function () {

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
    cy.get('input[type="search"]').type('Cypress Test Page');
    cy.contains('Delete').first().click();
    cy.contains('Confirm Delete').click();

    // cy.get('input[name="data[url]').should('have.value', '/cypress-test-page');
    // cy.get('input[name="data[heroTitle]"]').type('Cypress Hero');
    // cy.get('input[name="data[pageCssClass]"]').type('Cypress Hero');
    // cy.get('input[name="data[metaTitle]"]').type('Cypress Meta Title');
    // cy.get('textarea[name="data[metaDescription]"]').type('Cypress Meta Description');
    // cy.contains('Submit').click();

    // cy.contains('Cypress Hero');
    // cy.url().should('include', '/cypress-test-page');

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

