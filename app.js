
/**
 * The application entry point
 */

require('./src/bootstrap')
const config = require('config')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const httpStatus = require('http-status-codes')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const routes = require('./src/routes')
const logger = require('./src/common/logger')



const swaggerDocument = YAML.load('./docs/swagger.yaml')
const app = express()

app.set('port', config.PORT)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

require('./app-routes')(app)

// Serve Swagger in /docs end point
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
// Error handler
app.use((err, req, res, next) => {
  if (err.isJoi) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: err.details[0].message
    })
  } else if (err.errors) {
    res.status(httpStatus.BAD_REQUEST).json({ message: err.errors })
  } else {
    const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR
    res.status(statusCode).json({ message: err.message || config.DEFAULT_MESSAGE })
  }
})

// Check if the route is not found or HTTP method is not supported
app.use('*', (req, res) => {
  const pathKey = req.baseUrl.substring(config.API_PREFIX.length)
  const route = routes[pathKey]
  if (route) {
    res.status(httpStatus.METHOD_NOT_ALLOWED).json({ message: 'The requested HTTP method is not supported.' })
  } else {
    res.status(httpStatus.NOT_FOUND).json({ message: 'The requested resource cannot be found.' })
  }
})

app.listen(app.get('port'), () => {
  logger.debug(`Express server listening on port ${app.get('port')}`)
})

module.exports = app
