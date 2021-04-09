const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Admin Modules", function () {
  beforeEach(() => {
    cy.SonicJs.login();
  });

  before(() => {
    // cy.SonicJs.login();

    //cleanup if previosu delete failed
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);

    cy.get("body").then($body => {
      if ($body.find('[aria-label*="AA Cypress"]').length > 0) {   
        cy.get('[aria-label*="AA Cypress"]').first().click();
        cy.wait(500);
        cy.contains("Confirm Delete").click();
      }
  });

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
    cy.wait(500); //wait for system id function to run

    cy.contains("Create Module").click();
    //
    // cy.url().should(
    //   "include",
    //   "/admin/modules"
    // );

    cy.wait(1000); //wait for system id function to run


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

  it("Content type delete", function () {
      cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);
      cy.get('[aria-label="Delete AA Cypress Module EDITED"]').first().click();
      cy.wait(500);
      cy.contains("Confirm Delete").click();
  });
});
