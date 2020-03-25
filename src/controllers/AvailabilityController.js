/**
 * This controller handles the requests related to provider availability
 */
const service = require('../services/AvailabilityService')

/**
 * Handles the request for getting the availability of a given provider.
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function getProviderSchedule (req, res) {
  res.send(await service.getProviderSchedule(req.query.providerEmail, req.query.date))
}

/**
 * Handles the request for getting the number of available time slots per day for a given month
 *
 * @param {Object} req The http request
 * @param {Object} res The http response
 */
async function countAvailableTimeSlots (req, res) {
  res.send(await service.countAvailableTimeSlots(req.query.providerEmail, req.query.month))
}

module.exports = {
  getProviderSchedule,
  countAvailableTimeSlots
}
