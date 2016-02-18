
var exec = require('child_process').execFile
  , assert = require('assert')

function execCallback(err, stdout, stderr) {
  assert(null, err)
  return
}

exports.execSeshat = function (fileName) {
  exec( 'seshat/seshat'
      , ['-c', 'Config/CONFIG', '-i', '../tmp/sketch']
      , { cwd: 'seshat/' }
      , execCallback
      )
}
