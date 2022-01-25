const Sequelize = require('sequelize').Sequelize;
const fs = require('fs')
const config = require('config')
const password = config.get('balonDBpassword')

//set up connection pool:
const sequelize = new Sequelize('balonTelemetryPublic', 'balonPublic', password, {
  dialect: 'mysql',
  host: 'localhost',
  logging: false
})

module.exports = sequelize
