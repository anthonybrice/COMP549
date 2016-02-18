
var express = require('express')
  , app = express()
  , fs = require('fs')
  , exec = require('child_process').execFile
  , assert = require('assert')

app.use(express.static('public'))

app.get('/', function (req, res) {
  var fileStream = fs.createReadStream('./index.html')
  fileStream.pipe(res)
})

app.get('/sketch', function (req, res) {
  console.log('Got a request from /sketch')

  // Write the sketch to a file for Seshat
  var scg = req.query.sketch
    , file = 'tmp/sketch' + Date.now()
  fs.writeFile(file, scg, function (err) {
    if (err) throw err
    exec( './seshat/seshat'
        , ['-c', 'seshat/Config/CONFIG', '-i', file]
        , execCallback
        )

    function execCallback(err, stdout) {
      if (err) throw err
      // remove last character, which should be newline
      stdout = stdout.substring(0, stdout.length - 1)
      // anything after new last newline should be tex representation
      var tex = stdout.substring(stdout.lastIndexOf('\n') + 1)
      console.log('Tex representation: ' + tex)
      res.send(tex)
    }
  })
})

app.get('/equate', function (req, res) {
  console.log('Got a request from /equate')
  console.log('expr1: ' + req.query.expr1)
  console.log('expr2: ' + req.query.expr2)
  var str = (req.query.expr1 + ' = ' + req.query.expr2).replace(/{|}/g, '')
  console.log('Testing: ' + str)

  exec( 'tungsten'
      , [ str ]
      , execCallback
      )

  function execCallback(err, stdout) {
    if (err) throw err
    console.log(stdout)

    if (stdout.length === 0) res.send("ERROR")

    var index = stdout.indexOf('Result\n')
    if (index === -1) index = stdout.indexOf('Alternate form\n') + 15
    else index += 7
    console.log('Index: '+ index)

    var result = stdout.substring(index)
                       .substring(0, stdout.indexOf('\n') - 1)

    console.log('Result: ' + result)
    if (result !== 'True') result = 'False'
    res.send(result)
  }
})

var server = app.listen(80, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('App listening at http://%s:%s', host, port)
})
