/// <reference types="cypress" />

context('Typeahead Accessibility test', () => {
  beforeEach(() => {
    cy.visit('/demo/accessibility-test.html');
    cy.injectAxe();
  });

  it('markup should be accessible', () => {
    cy.get('.publicityContainer img.fadeIn').should('exist');

    cy.checkA11y();
  });
});
