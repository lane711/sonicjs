const { expect } = require("chai");
const { iteratee } = require("lodash");
const cleanupTag = "cypress-test-cleanup-tag";

describe("Page Builder", function () {
  beforeEach(() => {
    cy.SonicJs.login();
  });

  before(() => {
    //cleanup incase any tests failed
    cy.SonicJs.clearCypressTestData();
  });

  // after(() => {
  //   //cleanup incase any tests failed
  //   cy.SonicJs.clearCypressTestData();
  // });

  it("Page create", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}`);
    cy.SonicJs.openPageBuilderPanel();

    cy.get("#new-page").click();

    cy.contains("New Page").should("be.visible");

    cy.get('input[name="data[title]').type("Cypress PB Test");
    cy.wait(1000);

    // cy.contains("Cypress PB Test").should("be.visible");

    cy.get('input[name="data[url]').should("have.value", "/cypress-pb-test");
    cy.get('input[name="data[heroTitle]"]').type("Cypress Hero");
    cy.get('input[name="data[pageCssClass]"]').type("cypress-pb-test");
    cy.get('input[name="data[metaTitle]"]').type("Cypress Meta Title");
    cy.get('textarea[name="data[metaDescription]"]').type(
      `Cypress Meta Description - ${cleanupTag}`
    );

    cy.contains("Submit").should("not.be.disabled");

    cy.contains("Submit").click();

    // cy.contains('Cypress Hero');
    // cy.url().should('include', '/cypress-test-page');
  });

  it("Add setion ", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/cypress-pb-test`);
    // cy.get(".sidebar-expander.collapsed").click();
    cy.contains("Add Section").should("be.visible");
    cy.contains("Add Section").click();
    cy.get(".mini-layout.thirds").click({ force: true });
    cy.wait(1000);

    cy.get('div:contains("Empty Column")').its("length").should("gte", 3);
  });

  it("Add title module ", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/cypress-pb-test`);
    cy.get("#sidebar-expander").should("have.class", "collapsed");
    cy.get(".pb-wrapper").should("have.class", "collapsed");
    cy.get("#sidebar-expander").click().click();
    cy.get("#sidebar-expander").should("have.class", "expanded");
    cy.contains("Add Element").should("be.visible");
    cy.contains("Title").should("be.visible");
    cy.contains("Accordian").should("be.visible");

    //drag the title over to the first column
    cy.get('[data-module-id="title"]').drag(".col-md-4");

    //unsaved module is showing on the page
    cy.contains("Ipsum De Lorem").should("be.visible");

    //unsved module form is showing in the sidebar
    cy.get(".formio-component-form .formio-component-text input").type(
      " cypress"
    );
    cy.get("#reset-module").should("be.visible");

    cy.get('[data-id="unsaved"]').should(
      "contain.text",
      "Ipsum De Lorem cypress"
    );
    cy.get(".panel-title").should("contain.text", "title");

    //check reset function on unsaved module
    cy.get("#reset-module").click();
    cy.get('[data-id="unsaved"]').should("not.have.text", "cypress");
    cy.get(".formio-component-form .formio-component-text input").should(
      "not.have.text",
      "cypress"
    );

    //update and save the module
    cy.get(`.formio-component-form .formio-component-text input[name="data[text]"]`).type(
      ` ${cleanupTag}`, {force:true}
    );
    cy.get(".formio-component-submit button").click()
    cy.contains('Module added to column'); //test growl
  });

  it.skip("Content edit", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/cypress-pb-test`);

  });
});
