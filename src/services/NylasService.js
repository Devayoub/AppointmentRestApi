/**
 * This service handles all the interactions with Nylas API
 */
const Nylas = require('nylas')
const config = require('config')
const _ = require('lodash')
const HttpStatus = require('http-status-codes')
const logger = require('../common/logger')
const errors = require('../common/errors')
const moment = require('moment')
const request = require('superagent')

Nylas.config({
  clientId: config.NYLAS_APPLICATION_CLIENT_ID,
  clientSecret: config.NYLAS_APPLICATION_CLIENT_SECRET
})

/**
 * Creates a calendar event in Nylas API
 *
 * @param {String} accessToken The nylas access token to use
 * @param {String} title The event title
 * @param {String} description The event description
 * @param {String} calendarId The id of the calendar in which to create the event
 * @param {array} participants an array of participants in the event
 * @param {Object} when an object holding the start_time/end_time of the event
 * @returns {Object} The created event
 */
async function createEvent (accessToken, title, description, calendarId, participants, when) {
  const nylas = Nylas.with(accessToken)
  try {
    const event = nylas.events.build()

    // set event data
    event.title = title
    event.description = description
    event.busy = true
    event.calendarId = calendarId
    event.participants = participants
    event.when = when

    // save the event
    await event.save()
    return event
  } catch (e) {
    await _checkNylasAuthenticationError(e)
    throw e
  }
}

/**
 * Gets the id of the calendar supposed to hold all Ognomy events.
 *
 * @param {String} accessToken The access token to use to get the calendar from Nylas API
 * @param {String} email The user email for whom to get the calendar id
 * @returns {String} The id of the calendar
 */
async function getOgnomyCalendarId (accessToken, email) {
  const nylas = Nylas.with(accessToken)
  try {
    const calendars = await nylas.calendars.list()

    // Check if the user has a calendar specific to Ognomy meeting using the configured calendar name
    const ognomyCalendar = calendars.find(c => c.name === config.OGNOMY_CALENDAR_NAME)
    if (_.isNil(ognomyCalendar)) {
      throw new errors.NotFoundError(
        `Calendar with name ${config.OGNOMY_CALENDAR_NAME} does not exist for ${email}`)
    }
    return ognomyCalendar.id
  } catch (e) {
    await _checkNylasAuthenticationError(e)
    throw e
  }
}

/**
 * Gets an account from Nylas API using the specified access token
 *
 * @param {String} accessToken The access token to use.
 * @returns {Object} The retrieved account object
 */
async function getAccount (accessToken) {
  const nylas = Nylas.with(accessToken)
  let account
  try {
    account = await nylas.account.get()
  } catch (e) {
    await _checkNylasAuthenticationError(e)
    throw e
  }
  return account
}

/**
 * Gets the list of events for the specified email and criteria.
 *
 * @param {String} accessToken The access token to use
 * @param {String} email The user email
 * @param {Object} criteria The search criteria
 */
async function listUserEvents (accessToken, email, criteria) {
  const nylas = Nylas.with(accessToken)
  let events = []
  try {
    // Get the calendar id used for Ognomy events
    const calendarId = await getOgnomyCalendarId(accessToken, email)

    // add the calendar filter to events retrieval criteria
    criteria.calendar_id = calendarId

    // Get the events
    events = await nylas.events.list(criteria)
  } catch (e) {
    await _checkNylasAuthenticationError(e)
    throw e
  }
  return events
}

/**
 * Gets an event by id from Nylas API
 *
 * @param {String} accessToken The access token to use.
 * @param {String} eventId The event id to get
 * @returns {Object} The retrieved event
 */
async function findEventById (accessToken, eventId) {
  const nylas = Nylas.with(accessToken)
  try {
    const event = await nylas.events.find(eventId)
    if (_.isNil(event)) {
      throw new errors.NotFoundError(`Event with id eventId is not found`)
    }

    return event
  } catch (e) {
    await _checkNylasAuthenticationError(e)
    throw e
  }
}

/**
 * Gets the user busy time slots.
 *
 * @param {String} accessToken The access token to use
 * @param {String} email The user email
 * @param {String} date The date for which to get the busy time slots
 * @returns {Array} an array of busy time slots
 */
async function getBusyTimeSlots (accessToken, email, date) {
  // Get the start time by concatenating the input date formatted as 'YYYY-MM-DD' with the configured day start/end time
  // We get busy slots for the entire day, we will consider lunch time later in the algorithm
  const startTime = moment(`${date}T${config.WORK_DAY_MORNING_START}`, moment.ISO_8601).unix()
  const endTime = moment(`${date}T${config.WORK_DAY_EVENING_END}`, moment.ISO_8601).unix()

  // The implementation here uses superagent to query the API directly
  // At the time of writing the code, NodeJS SDK do not support GET /free-busy endpoint yet
  // See https://docs.nylas.com/reference#calendars-free-busy
  const busyTimeSlots = await request.post(`${config.NYLAS_BASE_URL}/calendars/free-busy`)
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Content-Type', 'application/json')
    .send({
      start_time: `${startTime}`,
      end_time: `${endTime}`,
      emails: [email]
    })
  return busyTimeSlots.body[0].time_slots
}

/**
 * Checks whether there is an authentication error with Nylas API.
 *
 * @param {Object} e The error object to check
 */
function _checkNylasAuthenticationError (e) {
  if (e.statusCode === HttpStatus.UNAUTHORIZED) {
    throw new errors.ForbiddenError(`Invalid Nylas authentication, the account should be re-authenticated`)
  }
}

/**
 * Checks whether the user is bound with Nylas
 *
 * @param {Object} user The user to check
 */
function isUserBoundToNylas (user) {
  if (_.isNil(user.nylasAccessToken) || user.nylasAccessToken.trim().length === 0) {
    throw new errors.BadRequestError(`The user with email ${user.email} is not bound to Nylas`)
  }
}

module.exports = {
  createEvent,
  getOgnomyCalendarId,
  getAccount,
  listUserEvents,
  isUserBoundToNylas,
  findEventById,
  getBusyTimeSlots
}

logger.buildService(module.exports)
