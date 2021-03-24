/* eslint-disable cypress/no-unnecessary-waiting */
describe('AdRotator', () => {
  beforeEach(() => {
    cy.viewport(1200, 1200);
  });
  it('should rotate Ad correctly (sequentially)', () => {
    cy.visit('/demo/index.html');
    cy.get('#sidebar-placement-1').as('sidebarAd').find('a').should('have.attr', 'href', 'https://niketpathak.com#1');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/1.jpg');
    cy.wait(1000);
    cy.get('@sidebarAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#2');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/2.jpg');
    cy.wait(1000);
    cy.get('@sidebarAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#3');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/3.jpg');
  });

  it('should pause rotation on hover', () => {
    cy.visit('/demo/index.html');
    cy.get('#sidebar-placement-1').as('sidebarAd').find('a').should('have.attr', 'href', 'https://niketpathak.com#1');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/1.jpg');
    cy.get('@sidebarAd').trigger('mouseenter');
    cy.wait(3100);
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/1.jpg');
  });

  xit('should be visible only on desktop', () => {
    // bug in cypress doesn't retrieve the correct "window.screen.availWidth" even after setting the viewport
    cy.visit('/demo/index.html');
    cy.get('#hz-placement-1').as('leaderboardAd').find('a').should('have.attr', 'href', 'https://gospelmusic.io#5');
    cy.get('@leaderboardAd')
      .find('img')
      .should('have.attr', 'src', 'https://niketpathak.com/images/works/gkm_pic_sq.jpg');
    cy.viewport(400, 400);
    cy.reload(true);
    cy.get('#hz-placement-1').find('a').should('not.exist');
  });
});
