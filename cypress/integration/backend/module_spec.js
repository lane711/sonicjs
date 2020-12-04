const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Admin Modules", function () {
  beforeEach(() => {
    cy.SonicJs.login();
  });

  after(() => {
    // cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content-types`);
    // let deleteButtonPattern = '[aria-label*="Delete Cypress CT"]';

    // cy.get("body").then(($body) => {
    //   if ($body.find(deleteButtonPattern).length > 0) {
    //     //evaluates as true
    //     cy.get(deleteButtonPattern).first().click();
    //     cy.wait(500);
    //     cy.contains("Confirm Delete").click();
    //   }
    // });
  });

  it("Module create", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);
    cy.contains("New Module").click();
    cy.get('input[name="data[title]"]').type("AA Cypress Module");
    // cy.wait(5000);

    cy.contains("Create Module").click();
    //
    // cy.url().should(
    //   "include",
    //   "/admin/modules"
    // );

    cy.contains("AA Cypress Module");

  });

  it("Content type edit", function () {
    cy.visit(
      `${cy.SonicJs.getBaseUrl()}/admin/modules/edit/aa-cypress-module`
    );
    cy.get('input[name="data[title]"]').type(" EDITED");
    // cy.wait(3000);

    cy.contains("Save Title & SystemId").click();

    cy.wait(1000);
    cy.visit(
      `${cy.SonicJs.getBaseUrl()}/admin/modules`
    );
    cy.contains("AA Cypress Module EDITED");
  });

  // it("Content type delete", function () {
  //   cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);
  //   cy.get('[aria-label="Delete AA Cypress Module"]').first().click();
  //   cy.wait(500);
  //   cy.contains("Confirm Delete").click();
  // });
});
