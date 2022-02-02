const { expect } = require("chai");
const { iteratee } = require("lodash");



describe("Smoke Testing", function () {

  beforeEach(() => {
    cy.SonicJs.login();
  })


  it("All admin pages should load", function () {

    cy.SonicJs.adminPageVerify('admin', 'Content');

    cy.SonicJs.adminPageVerify('admin/content', 'New Content');

    cy.SonicJs.adminPageVerify('admin/media', 'New Media');

    // cy.SonicJs.adminPageVerify('admin/field-types', 'New Field Type');

    cy.SonicJs.adminPageVerify('admin/content-types', 'New Content Type');

    cy.SonicJs.adminPageVerify('admin/modules', 'New Module');

    cy.SonicJs.adminPageVerify('admin/theme-settings', 'Edit Theme Settings');

    cy.SonicJs.adminPageVerify('admin/site-settings-colors', 'Edit Site Colors');

    cy.SonicJs.adminPageVerify('admin/site-settings-typography', 'Edit Site Typography');

    cy.SonicJs.adminPageVerify('admin/menus', 'New Menu');

    cy.SonicJs.adminPageVerify('admin/security-settings', 'Security Settings, Coming soon');

    cy.SonicJs.adminPageVerify('admin/users', 'New User');

    cy.SonicJs.adminPageVerify('admin/site-settings', 'Edit Site Settings');

    cy.SonicJs.adminPageVerify('admin/logs', 'Logs Coming Soon');

    cy.SonicJs.adminPageVerify('admin/urls', 'URLs');

    cy.SonicJs.adminPageVerify('admin/taxonomy', 'Taxonomies');


  });


});

