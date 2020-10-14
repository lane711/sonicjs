const { expect } = require("chai");
const { iteratee } = require("lodash");



describe("Page Builder", function () {

  beforeEach(() => {
    cy.SonicJs.login();
  })


  it("Page create", function () {

    cy.visit(`${cy.SonicJs.getBaseUrl()}`);
    cy.get('#sidebar-expander').click();
    cy.contains('Template');
    cy.get('#add-tab').click();
    cy.get('#btn-add-page').click();
    cy.get('input[name="data[title]').type('Cypress PB Test')
    cy.get('input[name="data[url]').should('have.value', '/cypress-pb-test');
    cy.get('input[name="data[heroTitle]"]').type('Cypress Hero');
    cy.get('input[name="data[pageCssClass]"]').type('cypress-pb-test');
    cy.get('input[name="data[metaTitle]"]').type('Cypress Meta Title');
    cy.get('textarea[name="data[metaDescription]"]').type('Cypress Meta Description');
    cy.contains('Submit').click();

    // cy.contains('Cypress Hero');
    // cy.url().should('include', '/cypress-test-page');

  });

  // it("Content edit", function () {

  //   cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
  //   cy.get('input[type="search"]').type('Cypress Test Page');
  //   cy.contains('Cypress Test Page').click();
  //   cy.get('input[name="data[title]"]').type(' EDITED');
  //   cy.get('input[name="data[heroTitle]"]').type(' EDITED');
  //   cy.contains('Submit').click();

  //   cy.visit(`${cy.SonicJs.getBaseUrl()}/cypress-test-page-edited`);
  //   cy.contains('Cypress Hero EDITED');

  // });

  // it("Content delete", function () {

  //   cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
  //   cy.get('input[type="search"]').type('Cypress Test Page');
  //   cy.contains('Delete').first().click();
  //   cy.wait(1000);
  //   cy.contains('Confirm Delete').click();

  //   cy.url().should('include', '/admin/content');
  //   cy.contains('Cypress Test Page').should('not.exist');

  // });

});

