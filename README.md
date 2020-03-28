[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![GitHub repo size](https://img.shields.io/github/repo-size/HeAtNet/pi-can)
![GitHub issues](https://img.shields.io/github/issues-raw/HeAtNet/pi-can)
![GitHub pull requests](https://img.shields.io/github/issues-pr/HeAtNet/pi-can)

# pi-can

This package is capable of controlling CAN BUS modules with SPI interface.  
I have used the MCP2515 CAN BUS module, but might be useful for other CAN modules.

This package is created according to this arduino library:
https://github.com/Seeed-Studio/CAN_BUS_Shield

Currently, there is a major limitation in this software. Receiving a messege is quite slow. You can only receive about 10 messages in a second. I cannot resolve this issue yet. If you have any idea how to fix this, please let me know. (herczog.at97@gmail.com) Or you can send a pull request with the solution.

## Installation

Firstly you need to install Node.js. I am using `node v12.16.1` and `npm 6.14.3`.  
Follow this tutorial for installation:
[How to Install Node.js and npm on Raspberry Pi](https://linuxize.com/post/how-to-install-node-js-on-raspberry-pi/ "Installation guide for Node.js")

Secondly you need to create an npm project.

After that, you can install PI-CAN node module.  
Use:
```
npm i pi-can
```

Finally, you need to enable SPI communication on the Pi.  
Use `sudo raspi-config` and navigate to **5 Interfacing Options** > **SPI** > **Yes** *(enable)*

Reboot your Pi and you can start to programming your CAN network.

## Examples

### Basics
```javascript
const PiCan = require('pi-can');

const can = new PiCan('/dev/spidev0.0');
can.begin(PiCan.defs.CAN_500KBPS)
    .then(() => {
        console.log('INIT SUCCESS');
        // You can now use readMsg, sendMsg and others
    })
    .catch(() => {
        console.log('INIT FAILED');
    })
```

### Reading data from CAN module
```javascript
setInterval(async () => {
    let stat = await can.checkReceive();
    if (stat === PiCan.defs.CAN_MSGAVAIL) {
        can.readMsg()
            .then(data => console.log('Recv:', data))
            .catch(error => {
                console.log('error', error);
            })
    }
    if (stat === PiCan.defs.CAN_NOMSG) { }
}, 10);
```

### Writing data to CAN module
```javascript
// ID, Extended, RTR, Length, Data
can.sendMsg(123, false, false, 3, [1, 2, 3])
    .then(() => {
        console.log('SENT');
    })
    .catch(() => {
        console.log('Failed to send');
    })
```

### Applying fiilters to a message
```javascript
can.begin(PiCan.defs.CAN_500KBPS)
.then(() => can.setMask(0, false, 0x7ff))
.then(() => can.setMask(1, false, 0x7ff))
// You should set both masks. More detailes at API > setMask
.then(() => can.setFilter(0, false, 0xfa))
//.then(() => can.setFilter(0..5, Extended, Accepted_id))
```

### Reading and writing to CAN module's GPIO
```javascript
can.begin(PiCan.defs.CAN_500KBPS)
// You can set pinmodes like this:
.then(() => can.pinMode(PiCan.rxPin(0), PiCan.defs.MCP_PIN_OUT))
.then(() => can.pinMode(PiCan.rxPin(1), PiCan.defs.MCP_PIN_OUT))
.then(() => can.pinMode(PiCan.txPin(0), PiCan.defs.MCP_PIN_IN))
.then(() => can.pinMode(PiCan.txPin(1), PiCan.defs.MCP_PIN_IN))
.then(() => can.pinMode(PiCan.txPin(2), PiCan.defs.MCP_PIN_IN))

// Write to output
can.digitalWrite(PiCan.rxPin(0), true);
can.digitalWrite(PiCan.rxPin(1), false);

// Read from input
piCan.digitalRead(PiCan.txPin(0)).then(value=>console.log(value));
piCan.digitalRead(PiCan.txPin(1)).then(value=>console.log(value));
piCan.digitalRead(PiCan.txPin(2)).then(value=>console.log(value));
// You can also read written output value. Use rxPin with digitalRead.
```
**IMPORTANT**: TX is the input, RX is the output

## API

TODO

### begin(speedset, clockset)

### checkReceive()

### readMsg()

### sendMsg(id, ext, rtrBit, len, buf)

### trySendMsg(id, ext, rtrBit, len, buf, iTxBuf) { // iTxBuf = 0..2

### sleep()

### wake()

### setFilter(num, ext, ulData)

### getFilter(num)

### setMask(num, ext, ulData)

### getMask(num) 

### pinMode(pin, mode)

### digitalWrite(pin, mode)

### digitalRead(pin)


### TODO: Extended ID generator function

### static rxPin(pin)

### static txPin(pin)

### static defs
