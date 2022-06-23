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

  it("should show list of announcements, proposals and events", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubs/mgo-locker-room`);
    cy.contains("Proposals");
    cy.contains("Upcoming Events");
    cy.contains("Announcements");

    cy.get(".announcements-area")
      .find(".announcement-item")
      .its("length")
      .should("be.gte", 1);
    cy.get(".proposal-area").find(".card").its("length").should("be.gte", 1);
    cy.get(".events-area").find(".card").its("length").should("be.gte", 1);
  });

  it("should allow a new announcement to be created/edited/deleted", function () {
    //create
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubs/mgo-locker-room`);
    cy.contains("Post an Announcement").click({ force: true });
    cy.get('#genericModal',{ timeout: 10000 }).should('be.visible');
    cy.get('#genericModal input[name="data[title]"]',{ timeout: 10000 }).should('be.visible');

    cy.get('input[name="data[title]"]').type(
      "Cypress Announcement cypress-test-cleanup-tag"
    ).should(
      "have.value",
      "Cypress Announcement cypress-test-cleanup-tag"
    );
    cy.get(".ql-editor p").type(
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
      { delay: 0 }
    )
    cy.get(".formio-component-datetime .input").type("2040-01-01 11:00 AM", {
      delay: 0,
    }).should(
      "have.value",
      "2040-01-01 11:00 AM"
    );
    cy.wait(150); //wait for validation to fire
    cy.contains("Post Announcement").click();

    cy.location("pathname", { timeout: 10000 }).should(
      "include",
      `/clubs/mgo-locker-room`
    );

    cy.contains("Cypress Announcement cypress-test-cleanup-tag");

    //edit
    cy.get(".edit-announcement").first().click({ force: true });
    cy.get('#genericModal',{ timeout: 10000 }).should('be.visible');

    cy.get('input[name="data[title]"]')
      .type(" EDITED BY CYPRESS")
      .should(
        "have.value",
        "Cypress Announcement cypress-test-cleanup-tag EDITED BY CYPRESS"
      );

    cy.contains("Update Announcement").click();
    cy.contains(
      "Cypress Announcement cypress-test-cleanup-tag EDITED BY CYPRESS"
    );

    //delete
    cy.get(".delete-announcement").first().click({ force: true });
    cy.get('#genericModal',{ timeout: 10000 }).should('be.visible');

    cy.contains(
      '"title": "Cypress Announcement cypress-test-cleanup-tag EDITED BY CYPRESS"'
    );
    cy.contains("Confirm Delete").click();
    cy.contains(
      "Cypress Announcement cypress-test-cleanup-tag EDITED BY CYPRESS"
    ).should("not.exist");
  });

  it("should allow a new proposal to be created/edited/deleted", function () {
    //create
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubs/mgo-locker-room`);
    cy.contains("Submit Your Proposal").click({ force: true });
    cy.get('#genericModal',{ timeout: 10000 }).should('be.visible');
    cy.get('#genericModal input[name="data[title]"]',{ timeout: 10000 }).should('be.visible');

    cy.get('#genericModal input[name="data[title]"]').type(
      "Cypress Proposal cypress-test-cleanup-tag"
    ).should(
      "have.value",
      "Cypress Proposal cypress-test-cleanup-tag"
    );

    cy.get('textarea[name="data[body]"]').type(
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
      { delay: 0 }
    ).should(
      "have.value",
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum."
    );
    cy.get(".formio-component-expires .input").type("2040-01-01 11:00 AM", {
      delay: 0,
    }).should(
      "have.value",
      "2040-01-01 11:00 AM"
    );
    cy.get('input[name="data[discordLink]"]').type("https://discord.gg/acg5t", {
      delay: 0,
    }).should(
      "have.value",
      "https://discord.gg/acg5t"
    );
    cy.wait(150); //wait for validation to fire
    cy.contains("Submit For Review").click({ force: true });
    // cy.wait(5000);

    cy.location("pathname", { timeout: 10000 }).should(
      "include",
      `/clubs/mgo-locker-room`
    );

    cy.contains("Review Proposals").click({ force: true });

    cy.contains("Cypress Proposal cypress-test-cleanup-tag");

    //edit
    cy.contains("Review Proposals").click({ force: true });
    cy.contains("Cypress Proposal cypress-test-cleanup-tag");
    cy.get(".proposals .pending-edit-proposal").last().click({ force: true });
    cy.get('#genericModal',{ timeout: 10000 }).should('be.visible');

    cy.get('input[name="data[title]"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[name="data[approved]"]').click();
    cy.get('input[name="data[title]"]')
      .type(" EDITED BY CYPRESS")
      .should(
        "have.value",
        "Cypress Proposal cypress-test-cleanup-tag EDITED BY CYPRESS"
      );
    cy.contains("Update Proposal").click();
    cy.contains("Cypress Proposal cypress-test-cleanup-tag EDITED BY CYPRESS");

    //delete
    cy.get(".proposals .delete-proposal").last().click({ force: true });
    cy.get('#genericModal',{ timeout: 10000 }).should('be.visible');

    cy.contains(
      '"title": "Cypress Proposal cypress-test-cleanup-tag EDITED BY CYPRESS"'
    );
    cy.contains("Confirm Delete").click();
    cy.contains(
      "Cypress Proposal cypress-test-cleanup-tag EDITED BY CYPRESS"
    ).should("not.exist");
  });
});
