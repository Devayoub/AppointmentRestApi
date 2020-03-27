/**
 * Controller for email endpoints
 */
const HttpStatus = require('http-status-codes')
const EmailService = require('../services/EmailService')

/**
 * Send manual remainder email for GP
 * @param req the request
 * @param res the response
 */
async function sendEmail (req, res) {
  await EmailService.sendRemainderEmail(req.params.id, req.body)
  res.status(HttpStatus.NO_CONTENT).end()
}

module.exports = {
  sendEmail
}
