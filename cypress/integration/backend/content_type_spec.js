const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Admin Content Types", function () {
  beforeEach(() => {
    cy.SonicJs.login();
  });

  after(() => {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content-types`);
    let deleteButtonPattern = '[aria-label*="Delete Cypress CT"]';

    cy.get("body").then(($body) => {
      if ($body.find(deleteButtonPattern).length > 0) {
        //evaluates as true
        cy.get(deleteButtonPattern).first().click();
        cy.wait(500);
        cy.contains("Confirm Delete").click();
      }
    });
  });

  it("Content type create", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content-types`);
    cy.contains("New Content Type").click();
    cy.get('input[name="data[title]"]').type("Cypress CT");
    // cy.wait(5000);

    cy.get('input[name="data[systemid]"]').type("cypress-content-type");
    cy.contains("Create").click();
    cy.contains("Cypress CT");
    //
    cy.url().should(
      "include",
      "/admin/content-types/edit/cypress-content-type"
    );
  });

  it("Content type edit", function () {
    cy.visit(
      `${cy.SonicJs.getBaseUrl()}/admin/content-types/edit/cypress-content-type`
    );
    cy.get('input[name="data[title]"]').type(" EDITED");
    // cy.wait(3000);

    cy.contains("Save Title & SystemId").click();

    cy.wait(1000);
    cy.visit(
      `${cy.SonicJs.getBaseUrl()}/admin/content-types/edit/cypress-content-type`
    );
    cy.contains("Cypress CT EDITED");
  });

  it("Content type delete", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content-types`);
    cy.get('[aria-label="Delete Cypress CT EDITED"]').first().click();
    cy.wait(500);
    cy.contains("Confirm Delete").click();
  });
});
