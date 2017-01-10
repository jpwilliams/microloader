const path = require('path')
const _ = require('lodash')
const microloader = require('.')

const files = microloader('!(node_modules)', true)

console.log(files)
