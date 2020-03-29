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

### new PiCan(spi, debug)
Creates a new instance of this module.
> spi:
>> SPI device  
>> Usually it is `'/dev/spidev0.0'` or `'/dev/spidev0.1'`.
>
> debug:
>> `true` of `false`  
>> If set to true, you will get logs in the console about the current state of the program.

### begin(speedset, clockset)
Initialize the module and set speed and clock.
> speedset:
>> Any of these values:  
>> ```javascript
>> PiCan.defs.CAN_5KBPS  
>> PiCan.defs.CAN_10KBPS  
>> PiCan.defs.CAN_20KBPS  
>> PiCan.defs.CAN_25KBPS  
>> PiCan.defs.CAN_31K25BPS  
>> PiCan.defs.CAN_33KBPS  
>> PiCan.defs.CAN_40KBPS  
>> PiCan.defs.CAN_50KBPS  
>> PiCan.defs.CAN_80KBPS  
>> PiCan.defs.CAN_83K3BPS  
>> PiCan.defs.CAN_95KBPS  
>> PiCan.defs.CAN_100KBPS  
>> PiCan.defs.CAN_125KBPS  
>> PiCan.defs.CAN_200KBPS  
>> PiCan.defs.CAN_250KBPS  
>> PiCan.defs.CAN_500KBPS  
>> PiCan.defs.CAN_666KBPS  
>> PiCan.defs.CAN_1000KBPS  
>> ```
>> This speed needs to be consistent between the CAN nodes.  
>> You need to set this, there is no default value.
>
> clockset:
>> MCP_16MHz *(default)* or  
>> MCP_8MHz
>
> RETURN
>> `Promise`

### checkReceive()
Returns the status of the receive buffers.
> RETURN
>> `Promise`  
>> If fulfilled the return value can be `PiCan.defs.CAN_MSGAVAIL` or `PiCan.defs.CAN_NOMSG`

### readMsg()
Returns a message from the receive buffers.
> RETURN
>> `Promise`  
>> If fulfilled the return value is an object like this:  
>> ```javascript
>> {
>>   id: number, // The ID of the message
>>   ext: boolean, // Extended frame
>>   rtr: boolean, // Remote transmission request
>>   size: number, // Message length
>>   data: number[], // Message data
>> }
>> // Message data is an empty array if RTR received
>> ```

### sendMsg(id, ext, rtrBit, len, buf)
Sends a message to the CAN network.
> id
>> The ID of the message.  
>> Accepts **number** value.
>
> ext
>> True if you want to send an extended frame.  
>> Accepts **boolean** value.
>
> rtrBit
>> True if you want to send a remote request.  
>> Accepts **boolean** value.
>
> len
>> The length of the message  
>> Accepts **number** value from 0 to 8.
>
> buf
>> The content of the message  
>> Accepts an **array** of numbers. Needs to contain between 0 and 8 numbers.  
>> If rtrBit === true, this shuld be an empty array.
>
> RETURN
>> `Promise`  
>> If rejected the return value can be `PiCan.defs.CAN_GETTXBFTIMEOUT`


### trySendMsg(id, ext, rtrBit, len, buf, iTxBuf) {
Tries to send a message through a specified transfer buffer.
> iTxBuf
>> The transfer buffer's number.  
>> Accepts `0`, `1` or `2`
>
> See other parameters above, at the sendMsg description.

### sleep()
Takes the module into sleep mode.
> RETURN
>> `Promise`

### wake()
Wakes up the module
> RETURN
>> `Promise`

### setFilter(num, ext, ulData)
Sets a filter to the recived messages.  
You can use up to 6 filters *(from 0 to 5)*
> num
>> The number of the filter.  
>> Number between `0` and `5`
>
> ext
>> Extended ID, `boolean`
>
> ulData
>> The accepted ID, `number`
>
> RETURN
>> `Promise`

### getFilter(num)
Gets a filter value.
> num
>> The number of the filter
>
> RETURN
>> An object like this:
>> ```javascript
>> {
>>   id: number, // Filter ID
>>   ext: number // Is ID extended
>> }
>> ```

### setMask(num, ext, ulData)
Sets a mask to the filters.
> num
>> The number of the mask.  
>> Number `0` or `1`
>
> ext
>> Extended ID, `boolean`
>
> ulData
>> The applied mask on the filter, `number`
>
> RETURN
>> `Promise`

### getMask(num)
Gets a mask value.
> Parameters: Same as setFilter.

### pinMode(pin, mode)
Set pin mode on GPIO
> pin
>> Any of these values:  
>> ```javascript
>> PiCan.rxPin(0)
>> PiCan.rxPin(1)
>> PiCan.txPin(0)
>> PiCan.txPin(1)
>> PiCan.txPin(2)
>> ```
>
> mode
>> Any of these values:  
>> ```javascript
>> PiCan.defs.MCP_PIN_HIZ
>> PiCan.defs.MCP_PIN_INT
>> PiCan.defs.MCP_PIN_OUT
>> PiCan.defs.MCP_PIN_IN
>> ```
>> `MCP_PIN_IN` cannot be applied to RX pins.  
>> `MCP_PIN_HIZ` and `MCP_PIN_IN` cannot be applied to TX pins.

### digitalWrite(pin, mode)
Writes data to a GPIO output *(to RX pin)*
> pin
>> `PiCan.rxPin(0)` or `PiCan.rxPin(1)`
>
> mode
>> `true` or `false`
>
> RETURN
>> `Promise`

### digitalRead(pin)
Reads data from a GPIO input *(from TX pin)*
> pin
>> Any of these values  
>> ```javascript
>> PiCan.rxPin(0)
>> PiCan.rxPin(1)
>> PiCan.txPin(0)
>> PiCan.txPin(1)
>> PiCan.txPin(2)
>> ```
>
> RETURN
>> `Promise`  
>> If fulfilled the return can be `true` or `false`

### static rxPin(pin)
Get RX GPIO pin.
> pin
>> `0` or `1`
>
> RETURN
>> `PiCan.defs.MCP_RX0BF` or `PiCan.defs.MCP_RX1BF`

### static txPin(pin)
Get TX GPIO pin.
> pin
>> `0`, `1` or `2`
>
> RETURN
>> `PiCan.defs.MCP_TX0RTS`, `PiCan.defs.MCP_TX1RTS` or `PiCan.defs.MCP_TX2RTS`

### static defs
PiCan.defs contains all definitions for this module.
