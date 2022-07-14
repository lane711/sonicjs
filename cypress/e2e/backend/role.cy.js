const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Admin Roles", function () {
  before(() => {
    cy.SonicJs.clearCypressTestData();
  });
  beforeEach(() => {
    cy.SonicJs.login();
  });

  it.skip("Role create", function () {

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin`);
    cy.contains("Roles").click();
    
    cy.contains('Add Another').click();
    cy.wait(1000);
    cy.type('Cypress Role');
    cy.get('input[name="data[key]').type('cypress');
    cy.get('input[name="data[description]').type('cypress testing');

    cy.contains('Submit').click();
    cy.wait(1000);
    cy.contains('Cypress Role');
    cy.contains('cypress testing');
    cy.url().should('include', '/admin/roles');

  });

  it.skip("Role edit", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin`);
    cy.contains("Roles").click();
    cy.url().should('contain', 'role/edit')
    cy.get('input[name="data[title]"]').type(" edited");
    cy.get('input[name="data[key]"]').type("-cypress");

    cy.contains("Submit").click();
    cy.url().should('contain', 'admin/roles')

    cy.contains('Cypress Role cypress-test-cleanup-tag edited');

  });

  it.skip("Role delete", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/roles`);

    cy.get('[data-role="Cypress Role cypress-test-cleanup-tag edited"]').click();

    cy.wait(200);
    cy.contains("Confirm Delete").click();

    cy.wait(500);

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/roles`);

    cy.contains("Cypress Role").should("not.exist");
  });
});
