var serialport    = require("serialport");
var five          = require("johnny-five");
var timeout       = require('easy-timeout').Timeout;
var interval      = require('easy-timeout').Interval;
var io            = require('socket.io')();
var fs            = require('fs');

var serialPort = new serialport.SerialPort("/dev/cu.usbserial-AL00TXWF", {
  baudrate: 57600
});

var board = new five.Board({
  port: serialPort,
  debug: true
});

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

board.on("ready", function() {

  var leds          = new five.Leds([7, 8, 9, 10, 11]);

  var relay1        = new five.Relay({pin: 2, type: 'NO'});
  var relay2        = new five.Relay({pin: 3, type: 'NO'});
  var relay3        = new five.Relay({pin: 4, type: 'NO'});
  var relay4        = new five.Relay({pin: 5, type: 'NO'});
  var relay5        = new five.Relay({pin: 6, type: 'NO'});

  var volup_pin     = new five.Pin(17);
  var voldown_pin   = new five.Pin(16);
  var mute_pin      = new five.Pin(15);

  var sensor        = new five.Sensor({pin: 0, freq: 200});

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
       console.log('Other stuff happened');
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
      fs.writeFile('device/active_relay.json', active_relay, function() { });
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
      fs.writeFile('device/active_relay.json', active_relay, function() { });
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
      fs.writeFile('device/active_relay.json', active_relay, function() { });
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
      fs.writeFile('device/active_relay.json', active_relay, function() { });
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
      fs.writeFile('device/active_relay.json', active_relay, function() { });
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

  // Socket coms
  io.emit('message', 'Robot is online!');

  io.on('connection', function(socket, error) {
    //console.log('a user connected');
    socket.emit('message', 'You are connected to the Robot!');
    socket.on('event', function(data) {
      //console.log('event: ', data);
    });
    socket.on('switch_command', function(data) {
      toggle_Relay(data);
    });
    socket.on('volume_command', function(data) {
      volume(data);
    });
    socket.on('disconnect', function() {
      //console.log('a user disconnected');
    });
    socket.on('message', function(data) {
      //console.log('message', data);
    });
  });

  timeout('0m 0s')
    .then(function() {
      // Read initial setting
      fs.readFile('device/active_relay.json', 'utf8', (err, data) => {
        if (err) {
          console.log(err);
          // Write to file
          var active_relay = JSON.stringify({'active_relay': 1});
          fs.writeFile('device/active_relay.json', active_relay, function() { });
          toggle_Relay('1');
        } else {
          console.log(data);
          var setting = JSON.parse(data);
          switch(setting.active_relay) {
            case 1:
              toggle_Relay('1');
              console.log('relay 1 is active');
              break;
            case 2:
              toggle_Relay('2');
              console.log('relay 2 is active');
              break;
            case 3:
              toggle_Relay('3');
              console.log('relay 3 is active');
              break;
            case 4:
              toggle_Relay('4');
              console.log('relay 4 is active');
              break;
            case 5:
              toggle_Relay('5');
              console.log('relay 5 is active');
              break;
            default:
              console.log('default');
          }
        };
      });
      // var setting = JSON.parse( fs.readFileSync('device/active_relay.json', 'utf8') );
    });

  io.listen(3000);

});