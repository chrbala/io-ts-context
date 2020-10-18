
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./io-ts-context.cjs.production.min.js')
} else {
  module.exports = require('./io-ts-context.cjs.development.js')
}
