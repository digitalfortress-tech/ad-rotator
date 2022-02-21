/* eslint-disable cypress/no-unnecessary-waiting */
describe('AdRotator', () => {
  beforeEach(() => {
    cy.viewport(1280, 1080);
  });

  it('should rotate Ad sequentially without weights', () => {
    cy.visit('/demo/index.html');
    cy.get('#hz-placement-1').as('leaderboardAd').find('a').should('have.attr', 'href', 'https://gospelmusic.io#5');
    cy.get('@leaderboardAd')
      .find('img')
      .should('have.attr', 'src', 'https://niketpathak.com/images/works/gkm_pic_sq.jpg');
    cy.wait(2000);
    cy.get('@leaderboardAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#6');
    cy.get('@leaderboardAd').find('img').should('have.attr', 'src', './assets/images/square/6.jpeg');
    cy.wait(2000);
    cy.get('@leaderboardAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#6x');
  });

  it.only('should rotate Ad sequentially with weights', () => {
    cy.visit('/demo/index.html');
    cy.get('#sidebar-placement-1')
      .as('sidebarAd')
      .find('a')
      .should('have.attr', 'href', 'https://digitalfortress.tech#2');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/2.jpg');
    // cy.wait(2500);
    cy.get('@sidebarAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#3');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/3.jpg');
    // cy.wait(2500);
    cy.get('@sidebarAd').find('a').should('have.attr', 'href', 'https://niketpathak.com#1');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/1.jpg');
    // cy.wait(2500);
    cy.get('@sidebarAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#4');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/4.png');
    // cy.wait(2500);
    cy.get('@sidebarAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#5');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/5.jpg');
    // cy.wait(2500);
    cy.get('@sidebarAd').find('a').should('have.attr', 'href', 'https://digitalfortress.tech#6');
    cy.get('@sidebarAd').find('img').should('have.attr', 'src', './assets/images/square/6.jpeg');
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

  it('should be visible only on mobile', () => {
    cy.viewport(400, 400);
    cy.visit('/demo/index.html');
    cy.get('#mobile-placement-4').find('a').should('not.exist');
  });

  it('should be sticky', () => {
    cy.visit('/demo/index.html');
    cy.get('.scrollTarget').scrollIntoView();
    cy.get('#sq-placement-1').as('stickyAd').should('have.attr', 'class', 'stickyElx');
    cy.get('@stickyAd').should('have.css', 'position', 'fixed');
    cy.get('@stickyAd').should('have.css', 'top', '0px');
    cy.scrollTo(0);
    cy.get('@stickyAd').should('not.have.attr', 'class', 'stickyElx');
    cy.get('@stickyAd').should('not.have.css', 'position', 'fixed');
  });

  it('should be disabled in fallback mode', () => {
    cy.visit('/demo/index.html');
    cy.wait(1000);
    cy.get('#fallbackMode-placement').should('be.empty');
  });
});
