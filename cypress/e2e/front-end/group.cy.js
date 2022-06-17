const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Group", function () {
  beforeEach(() => {
    cy.SonicJs.frontEndLogin();
  });

  after(() => {
    // cy.visit(`${cy.SonicJs.getBaseUrl()}/admin/content`);
    // let deleteButtonPattern = '[aria-label*="Cypress PB Test"]';

    // cy.get("body").then(($body) => {
    //   if ($body.find(deleteButtonPattern).length > 0) {
    //     cy.get(deleteButtonPattern).first().click();
    //     cy.wait(500);
    //     cy.contains("Confirm Delete").click();
    //   }
    // });
  });

  it("list groups", function () {
    // cy.visit(`${cy.SonicJs.getBaseUrl()}`);
    // cy.get("#sidebar-expander").click();
    // cy.contains("Template").should("be.visible");
    // cy.get("#add-tab").click();
    // cy.get("#btn-add-page").click();
    // cy.wait(1000);
    // cy.get('input[name="data[title]').type("Cypress PB Test");
    // cy.get('input[name="data[url]').should("have.value", "/cypress-pb-test");
    // cy.get('input[name="data[heroTitle]"]').type("Cypress Hero");
    // cy.get('input[name="data[pageCssClass]"]').type("cypress-pb-test");
    // cy.get('input[name="data[metaTitle]"]').type("Cypress Meta Title");
    // cy.get('textarea[name="data[metaDescription]"]').type(
    //   "Cypress Meta Description"
    // );
    // cy.contains("Submit").click();

    // cy.contains('Cypress Hero');
    // cy.url().should('include', '/cypress-test-page');
  });

});
