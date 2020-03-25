/**
 * Insert test data to database.
 */
require('../app-bootstrap')
const models = require('./models')
const logger = require('./common/logger')
const helper = require('./common/helper')
const constants = require('../app-constants')

logger.info('Insert test data into database.')

const insertTestData = async () => {
  // create Physicians users
  const passwordHash = await helper.hashPassword('password')
  const roles = [constants.UserRoles.Physician]
  await models.User.create({
    email: 'daniel.rifkin@test.com',
    firstName: 'Daniel',
    lastName: 'Rifkin',
    passwordHash,
    address: 'Buffalo, NY',
    providerInfo: {
      qualifications: ['MD', 'MPH', 'FAASM'],
      biography: `I'm the founder of the Sleep Medecine Centers of Western New York`
    },
    roles,
    isProvider: true
  })

  await models.User.create({
    email: 'yourProviderEmail@gmail.com', // Use a gmail address here for verification
    firstName: 'Topcoder',
    lastName: 'Tester',
    passwordHash,
    address: 'Buffalo, NY',
    providerInfo: {
      qualifications: ['MD'],
      biography: `Expert Doctor of Medecine with 15 years of experience`
    },
    roles,
    isProvider: true
  })

  await models.User.create({
    email: 'keryn.e-gauch@test.com',
    firstName: 'Keryn',
    lastName: 'E.Gauch',
    passwordHash,
    address: 'Buffalo, NY',
    providerInfo: {
      qualifications: ['RPA-C', 'MS'],
      biography: `Multiple sclerosis expert, Registered Physician Assistant - Certified`
    },
    roles,
    isProvider: true
  })

  await models.User.create({
    email: 'marc.L-schelegel@test.com',
    firstName: 'Mark',
    lastName: 'L.Schelegel',
    passwordHash,
    address: 'Buffalo, NY',
    providerInfo: {
      qualifications: ['RPA-C', 'MS'],
      biography: `Multiple sclerosis expert, Registered Physician Assistant - Certified`
    },
    roles,
    isProvider: true
  })

  await models.User.create({
    email: 'christina.norris@test.com',
    firstName: 'Christina',
    lastName: 'Norris',
    passwordHash,
    address: 'Buffalo, NY',
    providerInfo: {
      qualifications: ['RPA-C', 'MS'],
      biography: `Multiple sclerosis expert, Registered Physician Assistant - Certified`
    },
    roles,
    isProvider: true
  })
}

insertTestData().then(() => {
  logger.info('Test data created')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})
