const { expect } = require("chai");
const { iteratee } = require("lodash");

describe("Group", function () {
  beforeEach(() => {
    cy.SonicJs.clearCypressTestData();
    cy.SonicJs.frontEndLogin();
  });

  after(() => {
    //cleanup incase any tests failed
    cy.SonicJs.clearCypressTestData();
  });

  after(() => {
  });

  it("list groups", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubhouses`);
    cy.contains("My Clubhouses");
    cy.contains("Clubhouses");

    cy.get(".clubhouses").find(".card").its("length").should("be.gte", 1);
  });

  it("should submit new clubhouse request form if validations met", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubhouses`);
    cy.get(".new-clubhouse-request").first().click();

    cy.get('input[name="data[fullName]"]').type("Mr. Cypress");
    cy.get('input[name="data[email]"]').type("cypress@test.com");
    cy.get('input[name="data[title]"]').type("Team Cypress");
    cy.get('textarea[name="data[clubDescription]"]').type(
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum."
    );
    cy.get('input[name="data[twitterHandle]"]').type("@testcypress");
    cy.get('input[name="data[discordInviteLink]"]').type(
      "https://discord.gg/acg5t"
    );
    cy.get('textarea[name="data[nftContractListCommaSeparated]"]').type(
      "0x772770fa1ce3196a1c895fbe49a634dce758d87d,0x772770fa1ce3196a1c895fbe49a634dce758d86e"
    );
    cy.get('textarea[name="data[anythingElseWeShouldKnow]"]').type(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );

    cy.contains("Submit Request").click();

    //Thanks for your new club request!
    cy.contains("New Club Request");
    cy.contains("Thanks for your new club request!");

    cy.contains("Ok").click();

    cy.contains("New Club Request").should('not.be.visible') 
  });

  it("should not submit new clubhouse request form if validations not met", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubhouses`);
    cy.get(".new-clubhouse-request").first().click();

    cy.get('input[name="data[fullName]"]').type("Mr. Cypress");

    cy.get('textarea[name="data[anythingElseWeShouldKnow]"]').type(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );

    cy.contains("Submit Request").should('be.disabled')

  });
});
