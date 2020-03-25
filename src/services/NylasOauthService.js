/**
 * Provides functions for handling the user authentication with Nylas API
 */
const constants = require('../../app-constants')
const logger = require('../common/logger')
const helper = require('../common/helper')
const errors = require('../common/errors')
const User = require('../models').User
const config = require('config')
const Nylas = require('nylas')
const Joi = require('joi')

Nylas.config({
  appId: config.NYLAS_APPLICATION_ID,
  appSecret: config.NYLAS_APPLICATION_SECRET
})

/**
 * Gets the url to be used for authenticating with Nylas API
 *
 * @param {String} baseUrl The base Url
 * @param {String} email The user email for whom to get the Url
 * @returns {String} The url to be used by the user to authenticate with Nylas API
 */
async function getAuthenticationUrl (baseUrl, email) {
  // Check if the email exists.
  const users = await helper.searchEntities(User, { email })
  if (!users || users.length === 0) {
    throw new errors.NotFoundError(`User with email ${email} does not exist`)
  }

  const options = {
    loginHint: email,
    redirectURI: `${baseUrl}/nylas/oauth/callback`,
    scopes: [constants.NylasAuthScopes.Calendar]
  }

  return { url: Nylas.urlForAuthentication(options) }
}

getAuthenticationUrl.schema = {
  baseUrl: Joi.string().uri().required(),
  email: Joi.email()
}

/**
 * Handles the callback of the user authentication with Nylas.
 * It exchanges the recieved code with a valid Nylas token.
 *
 * @param {String} code The code received from Nylas that will be exchanged for an access token
 */
async function exchangeCodeForToken (code) {
  const token = await Nylas.exchangeCodeForToken(code)

  // Get the user account information from Nylas using the access token to get the user email
  const nylas = Nylas.with(token)
  const nylasAccount = await nylas.account.get()

  // Get the user from the database
  const users = await helper.searchEntities(User, { email: nylasAccount.emailAddress })
  if (!users || users.length === 0) {
    throw new errors.NotFoundError(`Email ${nylasAccount.emailAddress} does not exist`)
  }

  // Email is unique in the database, then there will be only one user
  // Set the user nylas access token in the user entity
  users[0].nylasAccessToken = token

  // Save the user with the nylas access token set into the database
  await users[0].save()
}

exchangeCodeForToken.schema = {
  code: Joi.string().required()
}

module.exports = {
  getAuthenticationUrl,
  exchangeCodeForToken
}

logger.buildService(module.exports)
