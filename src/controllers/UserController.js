/**
 * User controller
 */

const httpStatus = require('http-status-codes')
const UserService = require('../services/UserService')

/**
  *
  * @param {Object} req
  * @param {Object} res
  */
const signUp = async (req, res) => {
  res.json(await UserService.createUser(req.body.email, req.body.code, req.body.password))
}

/**
 *
 * @param {Object} req
 * @param {Object} res
 */
const sendVerificationCode = async (req, res) => {
  res.json( await UserService.sendVerificationCode(req.body.email))
 
 
}
/**
 * AllProviders return the list of available providers (physicians)
 * @param {Object} req request
 * @param {Object} res response
 */

const allProviders = async (req, res) => {
  UserService.allProviders()
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res.status(httpStatus.NO_CONTENT).send()
    })
}
module.exports = {
  signUp,
  sendVerificationCode,
  allProviders
}
