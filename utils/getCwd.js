var _ = require('lodash')
var dirname = require('path').dirname

function getCwd () {
  var cwd = _.get(process, 'mainModule.filename')

  if (cwd) {
    return dirname(cwd)
  } else {
    return process.cwd()
  }
}

module.exports = getCwd
