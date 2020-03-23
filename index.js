const SPI = require('pi-spi');
const defs = require('./defs.js');

class PiCan {
  spiPort = null;
  spi = null;
  debug = false;
  constructor(spi, debug) {
    this.spiPort = spi;
    this.debug = debug;
    this.cout('New PiCan created');
  }
  cout(...message) {
    this.debug && console.log(...message);
  }
  open() {
    this.spi = SPI.initialize(this.spiPort);
    this.cout('PiCan opened');
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
}

module.exports = PiCan;
