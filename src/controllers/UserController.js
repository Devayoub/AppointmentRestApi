/**
 * Controller for users endpoints.
 * It provides a single function which handles the provider listing request.
 */
const service = require('../services/UserService')

/**
 * Handles the request to list all providers available.
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function listAllProviders (req, res) {
  res.send(await service.listAllProviders())
}

module.exports = {
  listAllProviders
}
