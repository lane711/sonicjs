const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Admin Users", function () {
  beforeEach(() => {
    cy.SonicJs.login();
  });

  it("User create", function () {

    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/users`);
    cy.contains('New User').click();
    cy.wait(1000);
    cy.get('input[name="data[email]"]').type('cypress-test-cleanup-tag@test.com');
    cy.get('input[name="data[password]').type('123456');
    cy.contains('Create User').click();
    cy.wait(2000);
    cy.contains('Users');
    cy.contains('cypress-test-cleanup-tag@test.com');
    cy.url().should('include', '/admin/users');

  });

  it("User edit", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/users`);
    cy.contains("cypress-test-cleanup-tag@test.com").click();
    cy.wait(1000);
    cy.get('input[name="data[firstName]"]').type("cypress first");
    cy.get('input[name="data[lastName]"]').type("cypress last");

    cy.get('[aria-label="Select Role(s)..."]').first().click();
    // cy.contains('Admin').click();

    
    cy.get(".formio-component-roles .choices").first().click();

    cy.get('input[name="data[lastName]"]').click();
    cy.contains("Submit").click();
    cy.wait(1000);
    cy.url().should('include', '/admin/users');

    //delete
    cy.get('[data-email="cypress-test-cleanup-tag@test.com"]').click();

    // cy.wait(1000);
    cy.contains("Confirm Delete").click();

    // cy.wait(1000);

    // cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/users`);

    cy.contains("cypress-test-cleanup-tag@test.com").should("not.exist");
  });

  it("User delete", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/users`);

        // cy.wait(1000);

    cy.get('[data-email="cypress-test-cleanup-tag@test.com"]').click();

    // cy.wait(1000);
    cy.contains("Confirm Delete").click();

    // cy.wait(1000);

    // cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/users`);

    cy.contains("cypress-test-cleanup-tag@test.com").should("not.exist");
  });
});
