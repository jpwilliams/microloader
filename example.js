module.exports = {
  foo: 'bar'
}

const microloader = require('.')

const files = microloader('!(node_modules)', {
  objectify: true,
  absolute: false,
  keepExtension: false
})

console.log(files)
