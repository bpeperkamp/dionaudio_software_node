var serialport    = require("serialport");
var five          = require("johnny-five");
var timeout       = require('easy-timeout').Timeout;
var interval      = require('easy-timeout').Interval;
var ip            = require('ip');
var fs            = require('fs');
var request       = require('request');
var WebSocket     = require('ws');
var server        = require('http').createServer();
var io            = require('socket.io')(server);
var express       = require('express');
var bodyParser    = require('body-parser');
var app           = express();

var serialPort = new serialport.SerialPort("/dev/ttyUSB0", {
  baudrate: 57600
});

var board = new five.Board({
  port: serialPort,
  debug: true
});

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

fs.readFile('./device/device.json', 'utf8', (err, data) => {
	if (err) {
		console.log('error');
	} else {
		var device = JSON.parse(data);
		var network_data = {"network": ip.address()};
		request({
			method: 'POST',
			uri: 'https://things.opensource-design.nl/api/login?' + 'email=' + encodeURIComponent(device.email) + '&password=' + encodeURIComponent(device.password),
		})
		.on('data', function(res) {
			var result = JSON.parse(res.toString());
			console.log(result.token);
			fs.writeFile('./device/token.json', res.toString(), function() { });
		})
		.on('error', function(error) {
			console.log('error sending data');
		})
	}
});

// Send IP number
// fs.readFile('./device/device.json', 'utf8', (err, data) => {
//   if (err) {
//     console.log('error');
//   } else {
//     var network_data = {"network": ip.address()};
//     fs.writeFile('./device/data.json', ip.address(), function() { });
//     request({
//       method: 'PATCH',
//       uri: 'https://things.opensource-design.nl/api/devices/' + data.replace(/(\r\n|\n|\r)/gm,"") + '?api_token=' + token,
//       agentOptions: {
//           securityOptions: 'SSL_OP_NO_SSLv3'
//       },
//       gzip: true,
//       json: network_data
//     })
//     .on('data', function(data) {
//       console.log('data sent');
//     })
//     .on('error', function(error) {
//       console.log('error sending data');
//     })
//   }
// });
// end Send IP

// Init Board and Johnny 5
board.on("ready", function() {

  var leds          = new five.Leds([7, 8, 9, 10, 11]);

  var relay1        = new five.Relay({pin: 2, type: 'NC'});
  var relay2        = new five.Relay({pin: 3, type: 'NC'});
  var relay3        = new five.Relay({pin: 4, type: 'NC'});
  var relay4        = new five.Relay({pin: 5, type: 'NC'});
  var relay5        = new five.Relay({pin: 6, type: 'NC'});

  var volup_pin     = new five.Pin(16);
  var voldown_pin   = new five.Pin(17);
  var mute_pin      = new five.Pin(15);

  var sensor        = new five.Sensor({pin: 0, freq: 100});

  sensor.scale(0, 100).on("change", function() {
    io.emit('volume_value', round(this.value, 0));
  });

  function volume(data) {
    switch(data) {
    case 'up_on':
      console.log('vol up on');
      volup_pin.high();
      break;
    case 'up_off':
      console.log('vol up off');
      volup_pin.low();
      break;
    case 'down_on':
      console.log('vol down on');
      voldown_pin.high();
      break;
    case 'down_off':
      console.log('vol down off');
      voldown_pin.low();
      break;
    default:
       //console.log('Other stuff happened');
       break;
    }
  }

  function toggle_Relay1() {
    relay1.open();
    relay2.open();
    relay3.close();
    relay4.close();
    relay5.close();
  }

  function toggle_Relay2() {
    relay1.close();
    relay2.close();
    relay3.close();
    relay4.close();
    relay5.close();
  }

  function toggle_Relay3() {
    relay1.close();
    relay2.close();
    relay3.open();
    relay4.close();
    relay5.close();
  }

  function toggle_Relay4() {
    relay1.close();
    relay2.open();
    relay3.close();
    relay4.open();
    relay5.close();
  }

  function toggle_Relay5() {
    relay1.close();
    relay2.open();
    relay3.close();
    relay4.open();
    relay5.open();
  }

  function toggle_Relay(number) {
    switch(number) {
    case '1':
      toggle_Relay1();
      // Write to file
      var active_relay = JSON.stringify({'active_relay': 1});
      fs.writeFile('./device/active_relay.json', active_relay, function() { });
      leds.off();
      leds[0].strobe();
      timeout('0m 0.5s')
        .then(function() {
          leds[0].stop().off();
          timeout('0m 0.5s')
            .then(function() {
              leds[0].on();
            })
        });
      break;
    case '2':
      toggle_Relay2();
      // Write to file
      var active_relay = JSON.stringify({'active_relay': 2});
      fs.writeFile('./device/active_relay.json', active_relay, function() { });
      leds.off();
      leds[1].strobe();
      timeout('0m 0.5s')
        .then(function() {
          leds[1].stop().off();
          timeout('0m 0.5s')
            .then(function() {
              leds[1].on();
            })
        });
      break;
    case '3':
      toggle_Relay3();
      // Write to file
      var active_relay = JSON.stringify({'active_relay': 3});
      fs.writeFile('./device/active_relay.json', active_relay, function() { });
      leds.off();
      leds[2].strobe();
      timeout('0m 0.5s')
        .then(function() {
          leds[2].stop().off();
          timeout('0m 0.5s')
            .then(function() {
              leds[2].on();
            })
        });
      break;
    case '4':
      toggle_Relay4();
      // Write to file
      var active_relay = JSON.stringify({'active_relay': 4});
      fs.writeFile('./device/active_relay.json', active_relay, function() { });
      leds.off();
      leds[3].strobe();
      timeout('0m 0.5s')
        .then(function() {
          leds[3].stop().off();
          timeout('0m 0.5s')
            .then(function() {
              leds[3].on();
            })
        });
      break;
    case '5':
      toggle_Relay5();
      // Write to file
      var active_relay = JSON.stringify({'active_relay': 5});
      fs.writeFile('./device/active_relay.json', active_relay, function() { });
      leds.off();
      leds[4].strobe();
      timeout('0m 0.5s')
        .then(function() {
          leds[4].stop().off();
          timeout('0m 0.5s')
            .then(function() {
              leds[4].on();
            })
        });
      break;
    default:
       console.log('Other stuff happened');
       break;
    }
  }

  timeout('0m 0s')
    .then(function() {
      mute_pin.low();
      // Read initial setting
      fs.readFile('./device/active_relay.json', 'utf8', (err, data) => {
        if (err) {
          // Write to file
          var active_relay = JSON.stringify({'active_relay': 1});
          fs.writeFile('./device/active_relay.json', active_relay, function() { });
          toggle_Relay('1');
        } else {
          var setting = JSON.parse(data);
          switch(setting.active_relay) {
            case 1:
              toggle_Relay('1');
              break;
            case 2:
              toggle_Relay('2');
              break;
            case 3:
              toggle_Relay('3');
              break;
            case 4:
              toggle_Relay('4');
              break;
            case 5:
              toggle_Relay('5');
              break;
            default:
              //console.log('default');
          }
        };
      });
    });

    timeout('0m 0.5s')
    .then(function() {
      mute_pin.high();
    });

    interval('5m 0s')
      .execute(function() {
        // Update IP
        fs.readFile('./device/data.json', 'utf8', (err, data) => {
          if (err) {
            console.log('error');
          } else {
            // Check if IP has changed
            if (data == ip.address()) {
              //console.log('IP has not changed');
            } else {
              //console.log('need to update ip');
              // Update IP
              fs.readFile('./device/device.json', 'utf8', (err, data) => {
                if (err) {
                  console.log('error');
                } else {
                  var network_data = {"network": ip.address()};
                  fs.writeFile('./device/data.json', ip.address(), function() { });
                  request({
                    method: 'PATCH',
                    uri: 'https://things.opensource-design.nl/api/devices/' + data.replace(/(\r\n|\n|\r)/gm,"") + '?api_token=' + token,
                    agentOptions: {
                        securityOptions: 'SSL_OP_NO_SSLv3'
                    },
                    gzip: true,
                    json: network_data
                  })
                  .on('data', function(data) {
                    //console.log('data sent');
                  })
                  .on('error', function(error) {
                    //console.log('error sending data');
                  })
                }
              });
              // end Update IP
            }
          }
        });

      });

    // Express routes
    var allowCrossDomain = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    }

    app.use(bodyParser.json());
    app.use(allowCrossDomain);

    app.post('/device/command', function(req, res) {
      //console.log('request received');
      var set_data = JSON.stringify(req.body);
      if (set_data == '{"command":"toggle_relay_1"}') {
        toggle_Relay('1');
        res.end();
        //res.send('toggle_relay_1');
      } else if (set_data == '{"command":"toggle_relay_2"}') {
        toggle_Relay('2');
        res.end();
        //res.send('toggle_relay_2');
      } else if (set_data == '{"command":"toggle_relay_3"}') {
        toggle_Relay('3');
        res.end();
        //res.send('toggle_relay_3');
      } else if (set_data == '{"command":"toggle_relay_4"}') {
        toggle_Relay('4');
        res.end();
        //res.send('toggle_relay_4');
      } else if (set_data == '{"command":"toggle_relay_5"}') {
        toggle_Relay('5');
        res.end();
        //res.send('toggle_relay_5');
      } else if (set_data == '{"command":"volume_up_on"}') {
        volume('up_on');
        res.end();
        //res.send('volume_up_on');
      } else if (set_data == '{"command":"volume_up_off"}') {
        volume('up_off');
        res.end();
        //res.send('volume_up_off');
      } else if (set_data == '{"command":"volume_down_on"}') {
        volume('down_on');
        res.end();
        //res.send('volume_down_on');
      } else if (set_data == '{"command":"volume_down_off"}') {
        volume('down_off');
        res.end();
        //res.send('volume_down_off');
      } else {
        res.send('Nothing here');
        res.end();
      }  
    });

    app.get('/device', function(req, res) {
      res.send({'status':'online'});
      res.end();
    });

    app.get('/media/artists', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0", "method": "AudioLibrary.GetArtists", "params": { "limits": { "start" : 0, "end": 3000000 }, "properties": ["thumbnail","fanart"], "sort": {"order":"ascending","method": "artist","ignorearticle": true } }, "id": 1}', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    app.get('/media/albums', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0","params": {"properties": ["thumbnail","year","fanart","title","artistid"]}, "method": "AudioLibrary.GetAlbums", "id": "libAlbums"} }', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    app.get('/media/songs', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0", "method": "AudioLibrary.GetSongs", "params": { "limits": { "start" : 0, "end": 3000000 }, "properties": [ "artist", "artistid", "albumid", "duration", "album", "track" ], "sort": { "order": "ascending", "method": "track", "ignorearticle": true } }, "id": "libSongs"}', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    app.get('/media/movies', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0", "method": "VideoLibrary.GetMovies", "params": { "limits": { "start" : 0, "end": 3000000 }, "properties" : ["runtime","art","rating","thumbnail","year"], "sort": { "order": "ascending", "method": "label" } }, "id": "libMovies"}', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    app.post('/media/movie_details', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0", "method":"VideoLibrary.GetMovieDetails","params":{"movieid": '+req.body.movieid+',"properties": ["runtime","thumbnail","rating","plot","year","fanart","genre"]}, "id": 1}', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    app.post('/media/play', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"id":"1","jsonrpc":"2.0","method":"Player.Open","params":{"item":'+JSON.stringify(req.body)+'}}', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    app.post('/media/command', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"id":"1","jsonrpc":"2.0","method":' + JSON.stringify(req.body.command) + '}', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    app.post('/media/command_full', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request='+JSON.stringify(req.body), function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
          res.end();
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    // What is currently playing
    app.get('/media/currently_playing', function(req, res) {
      request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          // Check if result
          if (result.result[0]) {
            if (result.result[0].playerid == 0 || result.result[0].playerid == '0') {
              request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["title", "album", "artist", "duration", "thumbnail"], "playerid": 0 }, "id": "AudioGetItem"}', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  res.send(body);
                  res.end();
                } else {
                  res.send('error');
                  res.end();
                }
              });
            } else if (result.result[0].playerid == 1 || result.result[0].playerid == '1') {
              request('http://127.0.0.1:8080/jsonrpc?request={"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["title", "season", "episode", "runtime", "showtitle", "tvshowid", "thumbnail", "file", "fanart", "streamdetails"], "playerid": 1 }, "id": "VideoGetItem"}', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  res.send(body);
                  res.end();
                } else {
                  res.send('error');
                  res.end();
                }
              });
            } else {
              res.send('other stuff is playing');
              res.end();
            }
          } else {
            //console.log('nothing is playing');
            res.send('nothing is playing');
            res.end();
          }
        } else {
          res.send('error');
          res.end();
        }
      });
    });

    

    // Kodi connection
    var kodi = new WebSocket('ws://127.0.0.1:9090/jsonrpc');
    
    kodi.on('message', function(data) {
      var player = JSON.parse(data);

      if (player.id == 'AudioGetItem') {
        io.emit('machine_message', {'type':'audio', 'data': player.result.item});
        io.emit('machine_message', {'player_type':'audio'});
      } else if (player.id == 'VideoGetItem') {
        io.emit('machine_message', {'type':'video', 'data': player.result.item});
        io.emit('machine_message', {'player_type':'video'});
      } else if (player.method == 'Player.OnStop') {
        io.emit('machine_message', {'player_inactive':true});
      } else if (player.method == 'Player.OnPause') {
        io.emit('machine_message', {'player_pause':true});
      } else if (player.method == 'Player.OnPlay') {
        io.emit('machine_message', {'player_inactive':false});
        io.emit('machine_message', {'player_pause':false});
      } else {
        // nothing
      }

      if (player.method == 'Player.OnPlay') {
        if (player.params.data.player.playerid == 0) {
          //console.log('player is audio, asking for more info');
          kodi.send(JSON.stringify({"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["title", "album", "artist", "duration", "thumbnail"], "playerid": 0 }, "id": "AudioGetItem"}) );
        } else if (player.params.data.player.playerid == 1) {
          //console.log('player is video, asking for more info');
          kodi.send(JSON.stringify({"jsonrpc": "2.0", "method": "Player.GetItem", "params": { "properties": ["title", "season", "episode", "duration", "showtitle", "tvshowid", "thumbnail", "fanart", "streamdetails"], "playerid": 1 }, "id": "VideoGetItem"}) );
        } else {
          // Exception
        }
      } else {
        //console.log('nothing is playing');
      }

    });

    kodi.on('open', function() {
      //console.log('kodi connection is open');
    });

    kodi.on('error', function() {
      //console.log('error');
    });

    kodi.on('close', function() {
      //console.log('close');
    });

    // Init Socket.io connection
    server.listen(3000, function(){
      //console.log('listening on *:3000');
    });

    app.listen(4000, function() {
      //console.log('listening on 4000')
    });

});
