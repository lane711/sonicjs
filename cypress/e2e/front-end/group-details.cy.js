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

  it.skip("should show list of announcements, proposals and events", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubs/mgo-locker-room`);
    cy.contains("Proposals");
    cy.contains("Upcoming Events");
    cy.contains("Announcements");

    cy.get(".announcements-area").find(".announcement-item").its("length").should("be.gte", 1);
    cy.get(".proposal-area").find(".card").its("length").should("be.gte", 1);
    cy.get(".events-area").find(".card").its("length").should("be.gte", 1);

  });

  it("should allow a new announcement to be created/edited/deleted", function () {
    //create
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubs/mgo-locker-room`);
    cy.contains("Post an Announcement").click({force: true});

    cy.get('input[name="data[title]"]').type("Cypress Announcement cypress-test-cleanup-tag");
    cy.get('textarea[name="data[body]"]').type(
      "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum."
    );
    cy.get('input[name="data[dateTime]"]').click();
    cy.contains("Cypress Announcement");

    //edit
    cy.get('edit link"').click();
    cy.contains("Edit Announcement");
    cy.get('input[name="data[title]"]').type(" EDITED");
    cy.get('Update Announcement"]').click();
    cy.contains("Cypress Announcement cypress-test-cleanup-tag EDITED");

    //delete





  });

  it.skip("should not submit new clubhouse request form if validations not met", function () {
    cy.visit(`${cy.SonicJs.getBaseUrl()}/clubhouses`);
    cy.get(".new-clubhouse-request").first().click();

    cy.get('input[name="data[fullName]"]').type("Mr. Cypress");

    cy.get('textarea[name="data[anythingElseWeShouldKnow]"]').type(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );

    cy.contains("Submit Request").should('be.disabled')

  });
});
