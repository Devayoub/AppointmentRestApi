/**
 * This service provides functions for appointments management
 */
const config = require('config')
const _ = require('lodash')
const moment = require('moment')
const Joi = require('joi')
const constants = require('../../app-constants')
const helper = require('../common/helper')
const errors = require('../common/errors')
const logger = require('../common/logger')
const nylasService = require('../services/NylasService')
const Appointment = require('../models').Appointment
const User = require('../models').User

/**
 * This private function creates an calendar event for a given user.
 *
 * @param {Object} user The user for whom to create the event
 * @param {Array} participants The array of the event participants
 * @param {Object} when The object holding the event start_time and end_time
 * @param {String} guestName The event guest name
 * @returns {Object} The created event
 */
async function _createEventForUser (user, participants, when, guestName) {
  // Check if user is bound to Nylas
  await nylasService.isUserBoundToNylas(user)

  // Get the calendarId
  const calendarId = await nylasService.getOgnomyCalendarId(user.nylasAccessToken, user.email)

  // Create the event for the user in Nylas API
  return nylasService.createEvent(
    user.nylasAccessToken,
    config.MEETING_TITLE_TEMPLATE.replace('{participant}', guestName),
    config.MEETING_DESCRIPTION_TEMPLATE.replace('{participant}', guestName),
    calendarId,
    participants,
    when)
}

/**
 * Creates an appointment using the specified data.
 *
 * @param {Object} data The appointment data to create
 * @returns {Object} an object with the id of the created appointment
 */
async function createAppointment (email, data) {
  // Get the logged-in user entity from the database (The user who creates the appointment)
  let users = await helper.searchEntities(User, { email })
  const loggedInUser = users[0]

  // Get the invitee entity from the database
  users = await helper.searchEntities(User, { email: data.inviteeEmail })

  if (!users || users.length === 0) {
    throw new errors.NotFoundError(`User with email ${data.inviteeEmail} does not exist`)
  }
  const invitee = users[0]

  if (_.includes(loggedInUser.roles, constants.UserRoles.Physician) &&
     _.includes(invitee.roles, constants.UserRoles.Physician)) {
    // Both the logged in user and the invitee are providers
    throw new errors.BadRequestError(`A provider is not allowed to schedule an appointment with another provider`)
  }

  if (_.includes(loggedInUser.roles, constants.UserRoles.Patient) &&
     _.includes(invitee.roles, constants.UserRoles.Patient)) {
    throw new errors.BadRequestError(`A patient is not allowed to schedule an appointment with another patient`)
  }

  // detect who is the provider (logged-in user or invitee)
  let provider
  let patient
  if (_.includes(loggedInUser.roles, constants.UserRoles.Physician)) {
    // The logged-in user is the provider
    provider = loggedInUser
    patient = invitee
  } else {
    // The logged-in user is the patient
    provider = invitee
    patient = loggedInUser
  }

  // TODO - Currently the patient name is not stored in the db ( not provided when creating an account)
  // TODO - So, we user the patient email as participant name for now
  const patientName = patient.email
  const participants = [{ name: patientName, email: patient.email }]

  // Construct the when parameter (with start/end times)
  const when = {
    start_time: moment(data.startTime, moment.ISO_8601).unix(),
    end_time: moment(data.endTime, moment.ISO_8601).unix()
  }

  // Create the event for the Provider in Nylas
  const event = await _createEventForUser(provider, participants, when, patientName)

  // Save the Appointment into the database
  const appointment = new Appointment({
    eventId: event.id,
    providerId: provider.id,
    patientId: patient.id
  })

  await appointment.save()

  return { appointmentId: appointment.id }
}

createAppointment.schema = {
  email: Joi.email(),
  data: Joi.object().keys({
    inviteeEmail: Joi.email(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required()
  })
}

/**
 * Gets the appointments for the user identified by the given email.
 * The appointments are filtered by the specified type (past, upcoming or ongoing)
 *
 * @param {String} email The email address of the user for whom to get the appointments.
 * @param {String} type The appointment types to get, should be one of 'past', 'upcoming' or 'ongoing'
 */
async function getAppointments (email, type) {
  // Get the user from the database.
  const users = await helper.searchEntities(User, { email })

  await helper.checkNullOrEmptyArray(users, `User with email ${email} does not exist`)

  // check the user role
  const isProvider = _.includes(users[0].roles, constants.UserRoles.Physician)

  // check if the provider is bound to Nylas
  if (isProvider) {
    await nylasService.isUserBoundToNylas(users[0])
  }

  let events = []
  let searchCriteria = {}

  const currentTimestamp = moment().unix()

  switch (type) {
    case constants.AppointmentTypes.Upcoming:
      // get upcoming events
      searchCriteria = { starts_after: currentTimestamp }
      break
    case constants.AppointmentTypes.Past:
      searchCriteria = { ends_before: currentTimestamp }
      break
    case constants.AppointmentTypes.Ongoing:
      searchCriteria = {
        starts_before: currentTimestamp,
        ends_after: currentTimestamp
      }
      break
    default:
      throw new errors.BadRequestError(`Unsupported appointment type ${type}`)
  }

  if (isProvider) {
    events = await nylasService.listUserEvents(users[0].nylasAccessToken, users[0].email, searchCriteria)
    return _formatProviderAppointments(events)
  } else {
    return _getPatientAppointments(users[0], searchCriteria)
  }
}

getAppointments.schema = {
  email: Joi.email(),
  type: Joi.string().required()
}

/**
 * This private function lists the patient appointments for the Nylas events that match the given search criteria
 *
 * @param {Object} patient The patient (User) entity for which to search th events
 * @param {Object} searchCriteria The events search criteria
 */
async function _getPatientAppointments (patient, searchCriteria) {
  // Get the list of the patient appointments from the database
  const dbAppointments = await helper.searchEntities(Appointment, { patientId: patient.id })
  const result = []

  for (const appointment of dbAppointments) {
    // Get the provider with whom the appointment is scheduled
    const provider = await User.findById(appointment.providerId)

    // add the event id to the search criteria
    searchCriteria.event_id = appointment.eventId

    // Get the event from nylas using the provider token
    const events = await nylasService.listUserEvents(provider.nylasAccessToken, provider.email, searchCriteria)

    if (events.length > 0) {
      // The event matches the search criteria, we add it to the result array
      const event = _.pick(events[0], constants.CalendarEventFields)
      event.when = {}
      event.when.startTime = moment.unix(events[0].when.start_time).toISOString()
      event.when.endTime = moment.unix(events[0].when.end_time).toISOString()

      result.push({
        ..._.pick(appointment, constants.AppointmentFields),
        ...{ event } })
    }
  }

  return result
}

/**
 * This private function gets and properly formats the provider appointments using the specified events
 *
 * @param {Object} events the events for which to populate the corresponding appointments.
 * @returns an array of the user appointments with the corresponding calendar events
 */
async function _formatProviderAppointments (events) {
  const appointments = []

  for (const event of events) {
    const res = _.pick(event, constants.CalendarEventFields)

    res.when = {}
    res.when.startTime = moment.unix(event.when.start_time).toISOString()
    res.when.endTime = moment.unix(event.when.end_time).toISOString()

    const dbAppointments = await helper.searchEntities(Appointment, { eventId: event.id })

    // Check the retrieved appointment from the database
    await helper.checkNullOrEmptyArray(dbAppointments, `Appointment not found for event with id = ${event.id}`)

    appointments.push({
      ..._.pick(dbAppointments[0], constants.AppointmentFields),
      ...{ event: res } })
  }
  return appointments
}

/**
 * Updates an appointment identified by the given appointment id using the specified data.
 *
 * @param {String} userId The id of the user for whom to update the appointment
 * @param {String} appointmentId The id of the appointment to update
 * @param {Object} data The data to use for updating the appointment
 */
async function updateAppointment (userId, appointmentId, data) {
  const user = await User.findById(userId)

  // Check if the logged-in user is a provider
  const isProvider = _.includes(user.roles, constants.UserRoles.Physician)

  // If the loggedIn user is a provider, we check the linking with Nylas
  if (isProvider) {
    await nylasService.isUserBoundToNylas(user)
  }

  // Check if the user has permissions to update the appointment and get the appointment entity
  const appointment = await _checkAppointmentOwnership(appointmentId, userId, isProvider)

  let providerNylasToken
  if (isProvider) {
    providerNylasToken = user.nylasAccessToken
  } else { // The user is a patient, both roles are exclusive
    // Get the provider to get its token
    const provider = await User.findById(appointment.providerId)
    providerNylasToken = provider.nylasAccessToken
  }

  // Get the event from Nylas
  const event = await nylasService.findEventById(providerNylasToken, appointment.eventId)

  // Construct the when parameter (with start/end times)
  const when = {
    start_time: moment(data.startTime, moment.ISO_8601).unix(),
    end_time: moment(data.endTime, moment.ISO_8601).unix()
  }

  // Set the updated dates
  event.when = when

  // update the busy flag for the event
  if (data.markAsCompleted) {
    event.busy = false
  }

  // we update the title/description for the event
  event.title = data.title
  event.description = data.description

  if (isProvider) {
    if (!_.isNil(data.meetingId)) {
      appointment.meetingId = data.meetingId
    }
    if (!_.isNil(data.meetingPassword)) {
      appointment.meetingPassword = data.meetingPassword
    }
  } else {
    // The user is a patient
    if (!_.isNil(data.meetingId) || !_.isNil(data.meetingPassword)) {
      throw new errors.ForbiddenError(
        `You are not allowed to update appointment meetingId/meeting password, Only providers can do it`)
    }
  }

  // save the event in nylas
  await event.save()

  // Save the appointment to the database
  await appointment.save()
}

updateAppointment.schema = {
  userId: Joi.string().required(),
  appointmentId: Joi.string().required(),
  data: Joi.object().keys({
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    markAsCompleted: Joi.boolean(),
    title: Joi.string(),
    description: Joi.string(),
    meetingId: Joi.string(),
    meetingPassword: Joi.string()
  })
}

/**
 * This private function checks whether the user identified by the given userId has update permissions on the appointment
 *
 * @param {String} appointmentId The id of the appointment for which to check the ownership
 * @param {String} userId The id of the user to for whom to check the ownership
 * @param {Boolean} isProvider The flag indicating whether the user is a provider or no
 */
async function _checkAppointmentOwnership (appointmentId, userId, isProvider) {
  // Find the appointment
  const appointment = await Appointment.findById(appointmentId)

  if (_.isNil(appointment)) {
    throw new errors.NotFoundError(`Appointment with id ${appointmentId} does not exist`)
  }

  // provider and patient roles are exclusive
  if ((isProvider && appointment.providerId !== userId) ||
        (!isProvider && appointment.patientId !== userId)) {
    throw new errors.ForbiddenError(`You are not allowed to update this appointment`)
  }
  return appointment
}

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment
}

logger.buildService(module.exports)
