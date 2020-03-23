let SPI = require('pi-spi');

class PiCan {
  spi = null;
  opened = false;
  debug = false;
  constructor(spi, debug) {
    this.debug = debug;
    this.spi = SPI.initialize(spi);
    this.cout('New PiCan created');
  }
  cout(...message) {
    this.debug && console.log(...message);
  }
  test() {
    let test = Buffer.from([0xC0]);
    this.spi.transfer(test, test.length, (e, d) => {
      if (e) console.error(e);
      else this.cout(d);

      let test = Buffer.from([0x5, 0xF]);
      this.spi.transfer(test, test.length, (e, d) => {
        if (e) console.error(e);
        else this.cout(d);

        let test = Buffer.from([0xE0, 0x80]);
        this.spi.transfer(test, test.length, (e, d) => {
          if (e) console.error(e);
          else this.cout(d);

          let test = Buffer.from([0x3, 0xE, 0x0]);
          this.spi.transfer(test, test.length, (e, d) => {
            if (e) console.error(e);
            else this.cout(d, d[2] === 0x80 ? 'SUCCESS' : 'FAIL');
          });
        });
      });
    });
  }
}

module.exports = PiCan;
