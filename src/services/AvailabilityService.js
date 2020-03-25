/**
 * This service provides functions for availability management.
 */
const User = require('../models').User
const config = require('config')
const moment = require('moment')
const _ = require('lodash')
const Joi = require('joi')
const errors = require('../common/errors')
const logger = require('../common/logger')
const helper = require('../common/helper')
const constants = require('../../app-constants')
const nylasService = require('./NylasService')

/**
 * Gets the availability of the provider identified by the given email.
 *
 * @param {String} email The provider email
 * @param {String} date The date in format 'YYYY-MM-DD' for which to check the availability
 * @returns The array of free time slots of the provider in the given day
 */
async function getProviderSchedule (email, date) {
  // Get the user  by email
  const exampleUser = new User({ email })
  exampleUser.encryptFieldsSync()

  const providers = await User.find({ email: exampleUser.email })

  await helper.checkNullOrEmptyArray(providers, `User with email ${email} does not exist`)

  if (!_.includes(providers[0].roles, constants.UserRoles.Physician)) {
    throw new errors.BadRequestError(`The email ${email} is not a valid provider email`)
  }

  const busyTimeSlots = await nylasService.getBusyTimeSlots(providers[0].nylasAccessToken, providers[0].email, date)

  // In the next algorithm, we construct the time slots based on the date and time slot length
  // And we remove the busy time slots retrieved from Nylas  and ignore the lunch time

  // prepare the morning/evening start end times
  const morningStartTime = await helper.getUnixTime(date, config.WORK_DAY_MORNING_START)
  const morningEndTime = await helper.getUnixTime(date, config.WORK_DAY_MORNING_END)

  const eveningStartTime = await helper.getUnixTime(date, config.WORK_DAY_EVENING_START)
  const eveningEndTime = await helper.getUnixTime(date, config.WORK_DAY_EVENING_END)

  // The array to hold the time slots with their free/busy status
  const timeSlots = []

  // the index of the current busy time slot
  let busyTimeSlotIdx = 0

  // The time variable to be used for iterating over the work day time slots
  let time = morningStartTime
  while (time < eveningEndTime) {
    // variables to hold the slot start/end time
    let startTime
    let endTime
    // set the time slot flag to free by default
    let free = true
    if (time === morningEndTime) {
      // set the lunch time to busy
      timeSlots.push({
        startTime: moment.unix(time).format(config.TIME_SLOT_OUTPUT_TIME_FORMAT),
        endTime: moment.unix(eveningStartTime).format(config.TIME_SLOT_OUTPUT_TIME_FORMAT),
        free: false
      })

      time = eveningStartTime
      // continue to handle the next time slot
      continue
    }
    // check if the time slot is busy
    if (busyTimeSlotIdx < busyTimeSlots.length && time === busyTimeSlots[busyTimeSlotIdx].start_time) {
      // The reached time slot is busy
      startTime = time
      // calculate the end time
      endTime = Math.max(time + Math.floor(config.TIME_SLOT_LENGTH_MINUTES * constants.MinToSecondsConversionFactor),
        busyTimeSlots[busyTimeSlotIdx].end_time)

      time = endTime
      busyTimeSlotIdx++
      free = false
    } else {
      // time slot is free
      startTime = time
      endTime = time + Math.floor(config.TIME_SLOT_LENGTH_MINUTES * constants.MinToSecondsConversionFactor)
      time = endTime
      free = true
    }
    // Push the time slot start/end times and status to the time slots array
    timeSlots.push({
      startTime: moment.unix(startTime).format(config.TIME_SLOT_OUTPUT_TIME_FORMAT),
      endTime: moment.unix(endTime).format(config.TIME_SLOT_OUTPUT_TIME_FORMAT),
      free
    })
  }
  return timeSlots
}

getProviderSchedule.schema = {
  email: Joi.email(),
  date: Joi.string()
}

/**
 * This function counts the available time slots for the provider identified by the specified email for a given month.
 *
 * @param {String} email The email of the provider for whom to count the available time slots.
 * @param {String} month The month for which to count the available time slots in format 'YYYY-MM'
 */
async function countAvailableTimeSlots (email, month) {
  // validate the provided date
  if (!moment(month, config.MONTH_DATE_INPUT_FORMAT, true).isValid()) {
    throw new errors.BadRequestError(`The provided date ${month} is invalid, valid format is ${config.MONTH_DATE_INPUT_FORMAT}`)
  }

  // Get the month number from the input date
  const monthNumber = moment(month, config.MONTH_DATE_INPUT_FORMAT).month() + 1

  const year = moment(month, config.MONTH_DATE_INPUT_FORMAT).year()
  if (year < moment().year()) {
    throw new errors.BadRequestError(`The year ${year} should be greater or equal to the current year`)
  }

  // Set the variable for iterating over the month days to count the available spots (first day of the month)
  let day = 1

  // Check if the user is getting availability for the current month (if yes, we start from today instead of day 1)
  if (monthNumber === moment().month() + 1 && moment().year() === year) {
    // The user is getting the available time slots for the current month
    // Then we set the first day for which to get the available spots to today = moment().date()
    day = moment().date()
  }

  const result = []

  // iterate over the month days and count the available spots for each day
  const daysInMonth = moment(month, config.MONTH_DATE_INPUT_FORMAT).daysInMonth()
  while (day <= daysInMonth) {
    // Get the timeslots for the day we are processing
    const timeSlots = await getProviderSchedule(email, day < 10 ? `${month}-0${day}` : `${month}-${day}`)

    // count the free timeslots
    const count = _.countBy(timeSlots, (t) => t.free === true)

    // push the day and the corresponding available time slots count into the result

    result.push({ day, availableSlotsCount: count.true })
    ++day
  }

  return result
}

countAvailableTimeSlots.schema = {
  email: Joi.email(),
  month: Joi.string()
}

module.exports = {
  getProviderSchedule,
  countAvailableTimeSlots
}

logger.buildService(module.exports)
