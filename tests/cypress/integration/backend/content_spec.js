const { expect } = require("chai");
const { iteratee } = require("lodash");



describe("Admin Content", function () {

  beforeEach(() => {
    cy.SonicJs.login();
  })


  it("Content create", function () {

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
    cy.contains('New Content').click();
    cy.wait(1000);
    cy.get('[data-content-type="page"]').first().click();
    cy.get('input[name="data[title]"]').type('Cypress Test Page');
    cy.get('input[name="data[url]').should('have.value', '/cypress-test-page');
    cy.get('input[name="data[heroTitle]"]').type('Cypress Hero');
    cy.get('input[name="data[pageCssClass]"]').type('Cypress Hero');
    cy.get('input[name="data[metaTitle]"]').type('Cypress Meta Title');
    cy.get('textarea[name="data[metaDescription]"]').type('Cypress Meta Description');
    cy.contains('Submit').click();
    cy.wait(1000);
    cy.contains('Title');
    cy.url().should('include', '/admin/content/edit/page/');

  });

  it("Content edit", function () {

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
    cy.get('input[type="search"]').type('Cypress Test Page');
    cy.contains('Cypress Test Page').click();
    cy.get('input[name="data[title]"]').type(' EDITED');
    cy.get('input[name="data[heroTitle]"]').type(' EDITED');
    cy.contains('Submit').click();
    cy.wait(1000);

    cy.visit(`${cy.SonicJs.getBaseUrl()}/cypress-test-page-edited`);
    cy.contains('Cypress Hero EDITED');

  });

  it("Content delete", function () {

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
    cy.get('input[type="search"]').type('Cypress Test Page');
    cy.contains('Delete').first().click();
    cy.wait(1000);
    cy.contains('Confirm Delete').click();

    cy.url().should('include', '/admin/content');
    cy.contains('Cypress Test Page').should('not.exist');

  });

});

