var path = require('path')
var media = require('render-media')
var streamToBlobURL = require('stream-to-blob-url')

var appendCSV = require('./lib/append-csv')

module.exports = { render: render, append: append }

function render (entry, el, cb) {
  if (typeof el === 'string') el = document.querySelector(el)
  el.innerHTML = ''
  append(entry, el, cb)
}

function append (file, el, cb) {
  validateFile(file)
  if (typeof el === 'string') el = document.querySelector(el)
  if (!cb) cb = function () {}

  var extname = path.extname(file.name).toLowerCase()
  if (extname === '.csv') {
    appendCSV(file, el, function (err, elem) {
      if (err) return handleError(file, el, cb)
      return cb(null, elem)
    })
  }
  else {
    media.append(file, el, function (err, elem) {
      if (err) return handleError(file, el, cb)
      return cb(null, elem)
    })
  }
}

function validateFile (file) {
  if (file == null) {
    throw new Error('file cannot be null or undefined')
  }
  if (typeof file.name !== 'string') {
    throw new Error('missing or invalid file.name property')
  }
}

function handleError (file, el, cb) {
  var elem = document.createElement('iframe')
  streamToBlobURL(file.createReadStream(), file.name, 'text/plain', function (err, url) {
    if (err) return cb(err)
    elem.src = url
    elem.sandbox = 'allow-forms allow-scripts'
    el.appendChild(elem)
    return cb(null, elem)
  })
}
