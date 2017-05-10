var exists = require('fs').existsSync
var readdirSync = require('fs').readdirSync
var statSync = require('fs').statSync
var path = require('path')
var join = path.join
var basename = path.basename
var resolve = path.resolve
var _ = require('lodash')
var glob = require('glob')

function microloader (paths, options) {
  if (!paths) {
    throw new Error('Error loading files; invalid "paths" argument', paths)
  }

  if (!(paths instanceof Array)) {
    if (typeof paths !== 'string') {
      throw new Error('Error loading files; invalid "paths" argument', paths)
    }

    paths = [paths]
  }

  var parsedOptions = {
    objectify: !!_.get(options, 'objectify'),
    keepExtension: !!_.get(options, 'keepExtension'),
    absolute: !!_.get(options, 'absolute'),
    cwd: _.get(options, 'cwd')
  }

  if (!parsedOptions.cwd) {
    parsedOptions.cwd = process.cwd()
  }

  var cwdLength = parsedOptions.cwd.length + 1
  var files = []

  paths.forEach(function (path) {
    files = files.concat(lookup(path, parsedOptions))
  })

  if (!parsedOptions.absolute) {
    files = _.map(files, function (file) {
      return resolve(parsedOptions.cwd, file).substr(cwdLength)
    })
  }

  if (!parsedOptions.objectify) {
    return files
  }

  var ret = {}

  files.forEach(function (file) {
    objectify(file, ret, parsedOptions)
  })

  return ret
}

function lookup (rawPath, options) {
  options = options || {}
  var files = []
  var re = new RegExp('\\.js$')
  var path = resolve(options.cwd, rawPath)

  if (basename(path)[0] === '.') {
    return []
  }

  if (!exists(path)) {
    if (exists(path + '.js')) {
      path += '.js'
    } else {
      files = glob.sync(rawPath, {
        cwd: options.cwd,
        absolute: options.absolute
      })

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

    // we may not still need the .-prefix check now
    // as it's done at the top of the function
    if (!stat.isFile() || !re.test(file) || basename(file)[0] === '.') {
      return
    }

    files.push(file)
  })

  return files
}

function objectify (file, files, options) {
  var chunks = _.filter(file.split(path.sep))

  if (!options.keepExtension) {
    chunks[chunks.length - 1] = path.basename(chunks[chunks.length - 1], path.extname(chunks[chunks.length - 1]))
  }

  var setPath = ''

  chunks.forEach(function (chunk) {
    setPath += '[\'' + chunk + '\']'
  })

  var ex = require(resolve(options.cwd, file))

  _.set(files, setPath, ex)
}

module.exports = microloader
