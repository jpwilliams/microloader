module.exports = {
  foo: 'bar'
}

const microloader = require('.')

const files = microloader('utils', {
  objectify: false,
  absolute: true,
  keepExtension: false
})

console.log(files)
