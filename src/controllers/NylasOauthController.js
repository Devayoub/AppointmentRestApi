/**
 * This controller handles the Oauth requests for authenticating users with Nylas
 */
const service = require('../services/NylasOauthService')

/**
 * Handles the request to get the url to be used for authenticating a user with Nylas
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function getAuthenticationUrl (req, res) {
  res.send(await service.getAuthenticationUrl(`${req.protocol}://${req.headers.host}`, req.query.email))
}

/**
 * Handles the request to exchange the Nylas code for an access token.
 * It is the callback of the authentication url retrieval.
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function exchangeCodeForToken (req, res) {
  await service.exchangeCodeForToken(req.query.code)
  res.end()
}

module.exports = {
  getAuthenticationUrl,
  exchangeCodeForToken
}
