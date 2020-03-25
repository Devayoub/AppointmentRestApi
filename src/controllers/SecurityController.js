/**
 * Controller for security endpoints
 */
const service = require('../services/SecurityService')
const HttpStatus = require('http-status-codes')

/**
 * Handles the login request.
 *
 * @param req the http request
 * @param res the http response
 */
async function login (req, res) {
  res.send(await service.login(req.body))
}

/**
 * Handles the request for sending the verification code to a user.
 *
 * @param req the http request
 * @param res the http response
 */
async function sendVerificationCode (req, res) {
  await service.sendVerificationCode(req.query)
  res.end()
}

/**
 * Handles the signup request.
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function signup (req, res) {
  await service.signup(req.body)
  res.status(HttpStatus.CREATED).end()
}

module.exports = {
  login,
  sendVerificationCode,
  signup
}
