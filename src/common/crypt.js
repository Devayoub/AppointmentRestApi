/**
 * This module contains the winston logger configuration.
 */

const _ = require('lodash')

const getParams = require('get-parameter-names')
const crypto = require('./crypto')

const Encrypt = (service) => {
  _.each(service, (method, name) => {
    if (method.schema) {
    }

    if (!method.encrypt && !method.decrypt) {
      return
    }
    const params = method.params || getParams(method)
    service[name] = async function () {
      const args = [...arguments]
      let encrypted = []
      let decrypted = []

      if (method.encrypt) {
        _.each(args, (arg) => {

          encrypted.push(crypto.encrypt(arg))
        })
        return method.apply(this, encrypted)
      }
      if (method.decrypt) {
        const result = await method.apply(this, args)

        if (_.isArray(result)) {
          _.forEach(result, (data) => {
            let keys = Object.keys(data.toJSON())
            const notDecrypt = ['createdAt', 'updatedAt', 'id']
            keys = keys.filter((item) => { return !(_.includes(notDecrypt, item)) })

            _.map(keys, (key) => {
              if (key.toString !== 'id' || 'updatedAt' || 'createdAt') {
                

                data[key] = crypto.decrypt(data[key])
              }
            })
          })
        }
        return result
      }
    }
    service[name].schema = method.schema
    service[name].params = params
  })
}

/**
 * Apply logger and validation decorators
 * @param {Object} service the service to wrap
 */
const encryptData = (service) => {
  Encrypt(service)
}

module.exports = encryptData
