/**
 * A service for sending emails
 */

const { createTransport } = require('nodemailer')
const config = require('config')
const ejs = require('ejs')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const helper = require('../common/helper')
const { EmailTemplate, Volunteer } = require('../models')

const transportOptions = {
  host: config.email.HOST,
  port: config.email.PORT,

  auth: {
    user: config.email.USER,
    pass: config.email.PASS
  }
}

const transporter = createTransport(transportOptions)

/**
 * Email the User
 * @param {String} subject Subject of the email
 * @param {String} body Body of the email
 * @param {String} recipients Email ID of recipients
 * @returns {Promise}
 */
const sendEmail = async (subject, body, recipients) => {
  // Set up the message and send email
  const message = {
    from: config.email.FROM,
    to: recipients,
    subject: subject,
    html: body
  }
  return transporter.sendMail(message)
}

module.exports = {
  sendEmail

}
