/**
 * Auth controller
 */

const SecurityService = require('../services/SecurityService')


/*
 * Login with credentials
 * @param {Object} req
 * @param {Object} res
 */
const login = async (req, res) => {
  res.json(await SecurityService.login(req.body.email, req.body.password))
}




module.exports = {
  login,

}
