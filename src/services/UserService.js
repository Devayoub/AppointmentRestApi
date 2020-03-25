/**
 * This service provides operations of users
 */
const logger = require('../common/logger')
const models = require('../models')
const constants = require('../../app-constants')
const helper = require('../common/helper')
const _ = require('lodash')

const User = models.User

/**
 * Lists all providers available in the system
 *
 * @returns {Array} The array of all available providers in the system.
 */
async function listAllProviders () {
  // Search all providers
  const providers = await helper.searchEntities(User, { isProvider: constants.BooleanStrings.True })
  const result = []

  // iterate over the results to pick only the needed fields
  _.each(providers, async p => {
    result.push({ ..._.pick(p, constants.ProviderFields) })
  })

  return result
}

module.exports = {
  listAllProviders
}

logger.buildService(module.exports)
