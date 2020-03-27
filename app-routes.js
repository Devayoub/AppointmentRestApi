
const _ = require('lodash')
const routes = require('./src/routes')
const logger = require('./src/common/logger')
const helper = require('./src/common/helper')
const config = require('config')
const authenticator = require('./src/common/auth')
const errors = require('http-errors')

module.exports = (app) => {
  _.each(routes, (verbs, url) => {
    _.each(verbs, (def, verb) => {
      let actions = [
        (req, res, next) => {
          req.signature = `${def.controller}#${def.method}`
          next()
        }
      ]

    const method = require(`./src/controllers/${def.controller}`)[ def.method ]; // eslint-disable-line

      if (!method) {
        throw new Error(`${def.method} is undefined, for controller ${def.controller}`)
      }

      if (def.middleware && def.middleware.length > 0) {
        actions = actions.concat(def.middleware)
      }

      // add Authenticator check if route has access check
      if (def.access) {
        actions.push((req, res, next) => {
          authenticator()(req, res, next)
        })

        actions.push((req, res, next) => {
          if (!req.authUser) {
            next(new errors.UnAuthorizedError('Not an Authorized User!'))
          }
          if (_.isArray(def.access) && def.access.length > 0 && !def.access.includes(req.authUser.role)) {
            next(new errors.Forbidden(`You don't have rights to perform this action!`))
          } else {
            next()
          }
        })
      }

      actions.push(method)

      logger.info(`API : ${verb.toLocaleUpperCase()} ${config.API_PREFIX}${url}`)
      app[verb](`${config.API_PREFIX}${url}`, helper.autoWrapExpress(actions))
    })
  })
}
