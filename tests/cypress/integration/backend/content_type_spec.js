const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Admin Content Types", function () {
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

  it("Content type create should  user to module", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content-types`);
    cy.contains("New Content Type").click();
    cy.wait(500);
    cy.contains("To create a new content type,");
  });

  it("Content type create via new module", function () {
    //first create a module
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);
    cy.contains("New Module").click();
    cy.get('input[name="data[title]"]').type("AA Cypress Module Content Type");
    cy.wait(500); //wait for system id function to run

    cy.contains("Create Module").click();
    cy.wait(500);

    cy.contains("AA Cypress Module Content Type");
  });

  it("Content type create to existing module", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);

    cy.contains("AA Cypress Module Content Type").click();

    cy.contains('New Content Type').click();

    cy.wait(500);

    cy.get('#createContentTypeForm input[name="data[title]"]').type("AA Cypress Module Content Type 2");

    cy.wait(500);

    cy.get('#createContentTypeForm button').click();

    cy.contains('AA Cypress Module Content Type 2');

  });

  it("Content type delete content type from module page", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules/edit/aa-cypress-module-content-type`);

    cy.contains("AA Cypress Module Content Type").click();

    cy.contains('New Content Type').click();

    cy.wait(500);

    cy.get('#createContentTypeForm input[name="data[title]"]').type("AA Cypress Module Content Type 2");

    cy.wait(500);

    cy.get('#createContentTypeForm button').click();

    cy.contains('AA Cypress Module Content Type 2');

    cy.wait(500);

    cy.contains('Delete').first().click();

    cy.wait(1000);

    cy.contains('Confirm Delete').click();

    cy.contains('AA Cypress Module Content Type 2').should('not.exist');


  });

  it.skip("Content type add field via drag and drop", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);

    cy.contains("AA Cypress Module Content Type").click();

    cy.get('[aria-label="content-type-aa-cypress-module-content-type"]')
      .first()
      .click();

    cy.contains("Edit AA Cypress Module Content Type");

    cy.wait(500);

    //TODO: add drag and drop

  });


  it("Content type edit raw data", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);

    cy.contains("AA Cypress Module Content Type").click();

    cy.get('[aria-label="content-type-aa-cypress-module-content-type"]')
      .first()
      .click();

    cy.contains("Edit AA Cypress Module Content Type");

    cy.contains("Raw").click();

    cy.contains("Manage Fields");

    cy.wait(500);

    cy.get(".jsoneditor-text")
      .invoke("val")
      .then((rawText) => {
        let json = JSON.parse(rawText);
        cy.log('BEFORE json from field ----->', JSON.stringify(json));

        json.title = "AA Cypress Module Content Type RAW EDIT";
        cy.log('AFTER json from field ----->', JSON.stringify(json));
        cy.get(".jsoneditor-text").clear();
        cy.get(".jsoneditor-text").click();
        cy.wait(500);
        cy.get(".jsoneditor-text").type(JSON.stringify(json), {
          parseSpecialCharSequences: false,
        });
      });

      cy.wait(500);

    cy.contains("Save Json").click();

    cy.wait(1000);

    cy.contains("AA Cypress Module Content Type RAW EDIT");
  });

  it("Content type delete", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content-types`);
    cy.get('[aria-label="Delete AA Cypress Module Content Type RAW EDIT"]').first().click();
    cy.wait(500);
    cy.contains("Confirm Delete").click();
    cy.wait(500);
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content-types`);
    cy.get('[aria-label="Delete AA Cypress Module Content Type RAW EDIT"]').should('not.exist');

    //mow delete test module
    cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/modules`);
    cy.get('[aria-label="Delete AA Cypress Module Content Type"]').first().click();
    cy.wait(500);
    cy.contains("Confirm Delete").click();
    cy.get('[aria-label="Delete AA Cypress Module Content Type"]').should('not.exist');

  });
});
