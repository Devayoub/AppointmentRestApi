/**
 * Initialize application and build services
 */

global.Promise = require('bluebird')
const config = require('config')
const fs = require('fs')
const joi = require('joi')
const path = require('path')
const logger = require('./common/logger')
const encrypt = require('./common/crypt')

joi.id = () => joi.string().trim()
// email is case insensitive, so lowercase it
joi.email = () => joi.string().email().trim().lowercase()
joi.page = () => joi.number().integer().positive().default(Number(config.DEFAULT_PAGE_INDEX))
joi.perPage = () => joi.number().integer().positive().max(Number(config.MAX_PER_PAGE)).default(Number(config.DEFAULT_PER_PAGE))
joi.sortOrder = () => joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('asc')

const buildServices = (dir) => {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const curPath = path.join(dir, file)
    fs.stat(curPath, (err, stats) => {
      if (err) return
      if (stats.isDirectory()) {
        buildServices(curPath)
      } else if (path.extname(file) === '.js') {
        logger.buildService(require(curPath))
      }
    })
  })
}

const Encrypt = (dir) => {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const curPath = path.join(dir, file)
    fs.stat(curPath, (err, stats) => {
      if (err) return
      if (stats.isDirectory()) {
        buildServices(curPath)
      } else if (path.extname(file) === '.js') {
        encrypt(require(curPath))
      }
    })
  })
}
Encrypt(path.join(__dirname, 'services'))
buildServices(path.join(__dirname, 'services'))
