/* eslint-disable no-undef */

describe('Smoke Testing', function () {
  it('login and logout of admin', function () {
    cy.SonicJs.login()
    cy.SonicJs.logout()
  })
})
