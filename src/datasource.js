/**
 * Init mongo datasource
 *
 */

// The mongoose instance.
const mongoose = require('mongoose')

// use bluebird promise library instead of mongoose default promise library
mongoose.Promise = global.Promise

// Database variable
let db

/**
 * Gets db connection for the given URL.
 * @param {String} url Database URL
 * @return {Object} Mongo DB connection for the given URL
 */
function getDb (url) {
  if (!db) {
    db = mongoose.connect(url, {
      useNewUrlParser: true
    })
  }
  return db
}

// exports the functions
module.exports = {
  getDb
}
