const getLoginUrl = () =>
  Cypress.env('GITHUB_ACTIONS')
    ? 'https://login.buffer.com/login'
    : 'https://login.local.buffer.com/login';

describe('Login', function() {
  const email = Cypress.env('PUBLISH_LOGIN_EMAIL') || 'admin@bufferapp.com';
  const password = Cypress.env('PUBLISH_LOGIN_PASSWORD') || 'password';

  Cypress.Commands.add('loginWithCSRF', csrfToken => {
    cy.request({
      method: 'POST',
      url: getLoginUrl(),
      failOnStatusCode: false, // dont fail so we can make assertions
      form: true, // we are submitting a regular form body
      body: {
        email,
        password,
        _csrf: csrfToken, // insert this as part of form body
      },
    });
  });

  it('logs in without the UI', function() {
    cy.request(getLoginUrl())
      .its('body')
      .then(body => {
        const $html = Cypress.$(body);
        const csrf = $html.find('input[name=_csrf]').val();

        cy.loginWithCSRF(csrf).then(resp => {
          expect(resp.status).to.eq(200);
        });
      });
    cy.visit('/');
  });
});
