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
var token         = '123456abcdefg1234567';

var serialPort = new serialport.SerialPort("/dev/ttyUSB0", {
  baudrate: 57600
});

var board = new five.Board({
  port: serialPort,
  debug: false
});

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

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
    //io.emit('volume_value', round(this.value, 0));
  });

  function volume(data) {
    switch(data) {
    case 'up_on':
      //console.log('vol up on');
      volup_pin.high();
      break;
    case 'up_off':
      //console.log('vol up off');
      volup_pin.low();
      break;
    case 'down_on':
      //console.log('vol down on');
      voldown_pin.high();
      break;
    case 'down_off':
      //console.log('vol down off');
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
    relay2.open();
    relay3.open();
    relay4.close();
    relay5.close();
  }

  function toggle_Relay4() {
    relay1.close();
    relay2.close();
    relay3.close();
    relay4.open();
    relay5.close();
  }

  function toggle_Relay5() {
    relay1.close();
    relay2.close();
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
      // Update IP
      // end Update IP
      mute_pin.low();
      // Read initial setting
      fs.readFile('./device/active_relay.json', 'utf8', (err, data) => {
        if (err) {
          //console.log(err);
          // Write to file
          var active_relay = JSON.stringify({'active_relay': 1});
          fs.writeFile('./device/active_relay.json', active_relay, function() { });
          toggle_Relay('1');
        } else {
          var setting = JSON.parse(data);
          switch(setting.active_relay) {
            case 1:
              toggle_Relay('1');
              //console.log('relay 1 is active');
              break;
            case 2:
              toggle_Relay('2');
              //console.log('relay 2 is active');
              break;
            case 3:
              toggle_Relay('3');
              //console.log('relay 3 is active');
              break;
            case 4:
              toggle_Relay('4');
              //console.log('relay 4 is active');
              break;
            case 5:
              toggle_Relay('5');
              //console.log('relay 5 is active');
              break;
            default:
              //console.log('default');
          }
        };
      });
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

    // Socket.io connection
    
    io.on('connection', function(socket){
      io.emit('machine_message', {'status':'online', 'message':'Welcome!'});
      
      socket.on('client_message', function(command) {
        
        if (command == 'toggle_relay_1') {
          toggle_Relay('1');
          io.emit('machine_message', {'active_relay':'1'});
        } else if (command == 'toggle_relay_2') {
          toggle_Relay('2');
          io.emit('machine_message', {'active_relay':'2'});
        } else if (command == 'toggle_relay_3') {
          toggle_Relay('3');
          io.emit('machine_message', {'active_relay':'3'});
        } else if (command == 'toggle_relay_4') {
          toggle_Relay('4');
          io.emit('machine_message', {'active_relay':'4'});
        } else if (command == 'toggle_relay_5') {
          toggle_Relay('5');
          io.emit('machine_message', {'active_relay':'5'});
        } else if (command == 'volume_up_on') {
          volume('up_on');
        } else if (command == 'volume_up_off') {
          volume('up_off');
        } else if (command == 'volume_down_on') {
          volume('down_on');
        } else if (command == 'volume_down_off') {
          volume('down_off');
        } else {
          //console.log('something else');
        }

      });

    });

    // Kodi connection
    var kodi = new WebSocket('ws://127.0.0.1:9090/jsonrpc');
    
    kodi.on('message', function(data) {
      var player = JSON.parse(data);
      
      if (player.method == 'Player.OnPlay') {
        
        if (player.params.data.player.playerid == 0) {
          console.log('audio is playing');
          io.emit('machine_message', 'audio is playing');
        } else if (player.params.data.player.playerid == 1) {
          console.log('video is playing');
          io.emit('machine_message', 'video is playing');
        } else if (player.params.data.player.playerid == -1) {
          console.log('other player is playing');
          io.emit('machine_message', 'other player is playing');
        } else {
          console.log('something strange is playing');
          io.emit('machine_message', 'something strange is playing');
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

});
