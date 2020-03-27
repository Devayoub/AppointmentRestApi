/**
 * Initialize database collections. Clear existing collections and insert test data
 */

require('../src/bootstrap')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const models = require('../src/models')
const { SaltLength } = require('../src/constants')
const logger = require('../src/common/logger')
const crypto = require('../src/common/crypto')
const helper = require('../src/common/helper')
/*
 * Delete records from all collections
 */
const clearDB = async () => {
  await models.User.deleteMany({})
}

/*
 * Insert test data
 */
const initDB = async () => {
  let PWD1 = 'nimda123'
  let PWD = await bcrypt.hash(crypto.encrypt(PWD1), SaltLength)
  const providers = [
    {
      email: 'provider1@email.com',
      password: PWD,
      role: 'Provider',
      calendarId: 'bnf5s2qk5do9hnnx85akk99ub',
      isActive: true
    },
    {
      email: 'client1@email.com',
      password: PWD,
      role: 'Client',
      calendarId: 'bnf5s2qk5do9hnnx85akk99ub',
      isActive: true
    }

  ]
  const crypted = []
  _.each(providers, (provider) => {
    const object = {}
    object.email = crypto.encrypt(provider.email)
    object.password = PWD
    object.role = crypto.encrypt(provider.role)
    object.calendarId = crypto.encrypt(provider.calendarId)
    object.isActive = crypto.encrypt(provider.isActive.toString())
    crypted.push(object)
  })
  logger.debug(crypted)

  await models.User.insertMany(crypted)
}

clearDB().then(() => {
  logger.info('Database tables cleared!')
  initDB().then(() => {
    logger.info('Test data loaded into Database')
    process.exit()
  })
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})
