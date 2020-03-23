const SPI = require('pi-spi');
const defs = require('./defs.js');

class PiCan {
  spi = null;
  debug = false;
  static defs = defs;
  constructor(spi, debug) {
    this.debug = debug;
    this.spi = SPI.initialize(spi);
    this.cout('New PiCan created');
  }
  cout(...message) {
    this.debug && console.log(...message);
  }
  close(cb) {
    this.spi.close(typeof cb === 'function' ? cb : () => { });
    this.spi = null;
    this.cout('PiCan closed');
  }
  test(cb) {
    let test = Buffer.from([defs.MCP_RESET]);
    this.spi.transfer(test, test.length, (e, d) => {
      if (e) console.error(e);
      else this.cout(d);

      let test = Buffer.from([defs.MCP_BITMOD, defs.MCP_DLC_MASK]);
      this.spi.transfer(test, test.length, (e, d) => {
        if (e) console.error(e);
        else this.cout(d);

        let test = Buffer.from([defs.MODE_MASK, defs.MODE_CONFIG]);
        this.spi.transfer(test, test.length, (e, d) => {
          if (e) console.error(e);
          else this.cout(d);

          let test = Buffer.from([defs.MCP_READ, defs.MCP_CANSTAT, 0]);
          this.spi.transfer(test, test.length, (e, d) => {
            if (e) console.error(e);
            else {
              this.cout(d, d[2] === defs.MODE_CONFIG ? 'SUCCESS' : 'FAIL');
              typeof cb === 'function' && cb;
            }
          });
        });
      });
    });
  }
  spi_readwrite(data) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    const dataBuffer = Buffer.from(data);
    return new Promise((resolve, reject) => {
      this.spi.transfer(dataBuffer, dataBuffer.length, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    })
  }
  mcp2515_reset() {
    this.cout('mcp2515_reset');
    return this.spi_readwrite(defs.MCP_RESET);
  }
  mcp2515_modifyRegister(address, mask, data) {
    return this.spi_readwrite([defs.MCP_BITMOD, address, mask, data]);
  }
  mcp2515_readRegister(address) {
    return this.spi_readwrite([defs.MCP_READ, address, 0]).then(e => e[2])
  }
  mcp2515_requestNewMode(newmode) {
    return new Promise((resolve, reject) => {
      const startTime = new Date();

      // Spam new mode request and wait for the operation  to complete
      const loop = () => {
        this.mcp2515_modifyRegister(defs.MCP_CANCTRL, defs.MODE_MASK, newmode)
          .then(() => this.mcp2515_readRegister(defs.MCP_CANSTAT))
          .then(statReg => {
            if ((statReg & defs.MODE_MASK) == newmode) { // We're now in the new mode
              resolve(defs.MCP2515_OK);
            } else if ((new Date() - startTime) > 200) { // Wait no more than 200ms for the operation to complete
              reject(defs.MCP2515_FAIL);
            } else {
              setTimeout(loop, 1);
            }
          })
      }
      loop();
    });
  }
  mcp2515_setCANCTRL_Mode(newmode) {
    return new Promise((resolve, reject) => {

      // If the chip is asleep and we want to change mode then a manual wake needs to be done
      // This is done by setting the wake up interrupt flag
      // This undocumented trick was found at https://github.com/mkleemann/can/blob/master/can_sleep_mcp2515.c
      /*
      if ((getMode()) == MODE_SLEEP && newmode != MODE_SLEEP) {
        // Make sure wake interrupt is enabled
        byte wakeIntEnabled = (mcp2515_readRegister(MCP_CANINTE) & MCP_WAKIF);
        if (!wakeIntEnabled) {
          mcp2515_modifyRegister(MCP_CANINTE, MCP_WAKIF, MCP_WAKIF);
        }

        // Set wake flag (this does the actual waking up)
        mcp2515_modifyRegister(MCP_CANINTF, MCP_WAKIF, MCP_WAKIF);

        // Wait for the chip to exit SLEEP and enter LISTENONLY mode.

        // If the chip is not connected to a CAN bus (or the bus has no other powered nodes) it will sometimes trigger the wake interrupt as soon
        // as it's put to sleep, but it will stay in SLEEP mode instead of automatically switching to LISTENONLY mode.
        // In this situation the mode needs to be manually set to LISTENONLY.

        if (mcp2515_requestNewMode(MODE_LISTENONLY) != MCP2515_OK) {
          return MCP2515_FAIL;
        }

        // Turn wake interrupt back off if it was originally off
        if (!wakeIntEnabled) {
          mcp2515_modifyRegister(MCP_CANINTE, MCP_WAKIF, 0);
        }
      }
      */

      // Clear wake flag
      Promise.resolve()
        .then(() => this.mcp2515_modifyRegister(defs.MCP_CANINTF, defs.MCP_WAKIF, 0))
        .then(() => this.mcp2515_requestNewMode(newmode))
        .then(resolve)
        .catch(reject)
    })
  }
  init(speedset, clockset) {
    if (typeof clockset === 'undefined') {
      clockset = defs.MCP_16MHz;
    }

    Promise.resolve()
      .then(() => this.mcp2515_reset())
      .then(() => this.mcp2515_setCANCTRL_Mode(defs.MODE_CONFIG))
      .then(() => {
        this.cout('Enter setting mode success');
      })
      .catch(error => {
        console.log('ERROR: ', error)
      });

    /*
    // set boadrate
    if (mcp2515_configRate(canSpeed, clock)) {
        this.cout('set rate fall!!');
        return res;
    }
    this.cout('set rate success!!');

    if (res == MCP2515_OK) {

        // init canbuffers
        mcp2515_initCANBuffers();

        // interrupt mode
        mcp2515_setRegister(MCP_CANINTE, MCP_RX0IF | MCP_RX1IF);

        #if (DEBUG_RXANY==1)
        // enable both receive-buffers to receive any message and enable rollover
        mcp2515_modifyRegister(MCP_RXB0CTRL,
                               MCP_RXB_RX_MASK | MCP_RXB_BUKT_MASK,
                               MCP_RXB_RX_ANY | MCP_RXB_BUKT_MASK);
        mcp2515_modifyRegister(MCP_RXB1CTRL, MCP_RXB_RX_MASK,
                               MCP_RXB_RX_ANY);
        #else
        // enable both receive-buffers to receive messages with std. and ext. identifiers and enable rollover
        mcp2515_modifyRegister(MCP_RXB0CTRL,
                               MCP_RXB_RX_MASK | MCP_RXB_BUKT_MASK,
                               MCP_RXB_RX_STDEXT | MCP_RXB_BUKT_MASK);
        mcp2515_modifyRegister(MCP_RXB1CTRL, MCP_RXB_RX_MASK,
                               MCP_RXB_RX_STDEXT);
        #endif
        // enter normal mode
        res = setMode(MODE_NORMAL);
        if (res) {
            this.cout('Enter Normal Mode Fail!!');
            return res;
        }

        this.cout('Enter Normal Mode Success!!');
    }
    return ((res == defs.MCP2515_OK) ? defs.CAN_OK : defs.CAN_FAILINIT);*/
  }
}

module.exports = PiCan;
