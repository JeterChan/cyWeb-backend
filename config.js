const env = process.env.NODE_env || 'development'
const credentials = require(`./.credential.${env}`)
module.exports = {credentials}