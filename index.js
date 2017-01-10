var exists = require('fs').existsSync
var readdirSync = require('fs').readdirSync
var statSync = require('fs').statSync
var path = require('path')
var join = path.join
var basename = path.basename
var resolve = path.resolve
var _ = require('lodash')
var glob = require('glob')

function microloader (paths, shouldObjectify, keepExtension) {
  if (!paths) {
    throw new Error('Error loading files; invalid "paths" argument', paths)
  }

  if (!(paths instanceof Array)) {
    if (typeof paths !== 'string') {
      throw new Error('Error loading files; invalid "paths" argument', paths)
    }

    paths = [paths]
  }

  var files = []

  paths.forEach(function (path) {
    files = files.concat(lookup(path))
  })

  if (!shouldObjectify) {
    return files
  }

  var ret = {}

  files.forEach(function (file) {
    objectify(file, ret, keepExtension)
  })

  return ret
}

function lookup (path) {
  var files = []
  var re = new RegExp('\\.js$')

  if (!exists(path)) {
    if (exists(path + '.js')) {
      path += '.js'
    } else {
      files = glob.sync(path)

      if (!files.length) {
        throw new Error('Cannot resolve path "' + path + '"')
      }

      for (var i = 0; i < files.length; i++) {
        if (!re.test(files[i]) || basename(files[i])[0] === '.') {
          files.splice(i--, 1)
        }
      }

      return files
    }
  }

  var stat = statSync(path)

  if (stat.isFile()) {
    return [path]
  }

  readdirSync(path).forEach(function (file) {
    file = join(path, file)

    var stat = statSync(file)

    if (stat.isDirectory()) {
      files = files.concat(lookup(file))
    }

    if (!stat.isFile() || !re.test(file) || basename(file)[0] === '.') {
      return
    }

    files.push(file)
  })

  return files
}

function objectify (file, files, keepExtension) {
  var chunks = file.split(path.sep)

  if (!keepExtension) {
    chunks[chunks.length - 1] = path.basename(chunks[chunks.length - 1], path.extname(chunks[chunks.length - 1]))
  }

  var setPath = ''

  chunks.forEach(function (chunk) {
    setPath += '[\'' + chunk + '\']'
  })

  var ex = require(resolve(file))

  _.set(files, setPath, ex)
}

module.exports = microloader
