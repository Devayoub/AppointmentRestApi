/**
 * Initialize database tables. All data will be cleared.
 */
require('../app-bootstrap')
const models = require('./models')
const logger = require('./common/logger')

logger.info('Clear database tables.')

const clearDB = async () => {
  // clear database tables
  await models.Appointment.deleteMany({})
  await models.User.deleteMany({})
  await models.VerificationCode.deleteMany({})
}

clearDB().then(() => {
  logger.info('All database tables are cleared')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})
