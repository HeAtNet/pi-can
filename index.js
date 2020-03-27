const SPI = require('pi-spi');
const defs = require('./defs.js');
const sleep = require('sleep');


class PiCan {
  spi = null;
  debug = false;
  mcpMode = null;
  nReservedTx = 0;

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
  mcp2515_setRegister(address, value) {
    return this.spi_readwrite([defs.MCP_WRITE, address, value]);
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
  mcp2515_readStatus() {
    return this.spi_readwrite([defs.MCP_READ_STATUS, 0]).then(e => e[1])
  }
  setMode(opMode) {
    if (opMode != defs.MODE_SLEEP) {
      // if going to sleep, the value stored in opMode is not changed so that we can return to it later
      this.mcpMode = opMode;
    }
    return this.mcp2515_setCANCTRL_Mode(opMode);
  }
  getMode() {
    return this.mcp2515_readRegister(defs.MCP_CANSTAT) & defs.MODE_MASK;
  }
  mcp2515_setCANCTRL_Mode(newmode) {
    return new Promise((resolve, reject) => {

      // If the chip is asleep and we want to change mode then a manual wake needs to be done
      // This is done by setting the wake up interrupt flag
      // This undocumented trick was found at https://github.com/mkleemann/can/blob/master/can_sleep_mcp2515.c

      Promise.resolve()
        .then(() => this.getMode())
        .then(mode => {
          if (mode == defs.MODE_SLEEP && newmode != defs.MODE_SLEEP) {
            // Make sure wake interrupt is enabled
            let wakeIntEnabled;
            this.mcp2515_readRegister(defs.MCP_CANINTE)
              .then(reg => {
                wakeIntEnabled = (reg & defs.MCP_WAKIF);
                if (!wakeIntEnabled) {
                  return this.mcp2515_modifyRegister(defs.MCP_CANINTE, defs.MCP_WAKIF, defs.MCP_WAKIF);
                }
              })
              // Set wake flag (this does the actual waking up)
              .then(() => this.mcp2515_modifyRegister(defs.MCP_CANINTF, defs.MCP_WAKIF, defs.MCP_WAKIF))
              .then(() => this.mcp2515_requestNewMode(defs.MODE_LISTENONLY))
              .then(mode => {
                // If the chip is not connected to a CAN bus (or the bus has no other powered nodes) it will sometimes trigger the wake interrupt as soon
                // as it's put to sleep, but it will stay in SLEEP mode instead of automatically switching to LISTENONLY mode.
                // In this situation the mode needs to be manually set to LISTENONLY.

                if (mode != defs.MCP2515_OK) {
                  throw defs.MCP2515_FAIL;
                }

                // Turn wake interrupt back off if it was originally off
                if (!wakeIntEnabled) {
                  return this.mcp2515_modifyRegister(defs.MCP_CANINTE, defs.MCP_WAKIF, 0);
                }
              })
          }
        })

        .then(() => this.mcp2515_modifyRegister(defs.MCP_CANINTF, defs.MCP_WAKIF, 0)) // Clear wake flag

        .then(() => this.mcp2515_requestNewMode(newmode))
        .then(resolve)
        .catch(reject)
    })
  }
  mcp2515_configRate(canSpeed, clock) {
    return new Promise((resolve, reject) => {
      let set = 1;
      let cfg1;
      let cfg2;
      let cfg3;
      switch (clock) {
        case (defs.MCP_16MHz):
          switch (canSpeed) {
            case (defs.CAN_5KBPS):
              cfg1 = defs.MCP_16MHz_5kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_5kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_5kBPS_CFG3;
              break;

            case (defs.CAN_10KBPS):
              cfg1 = defs.MCP_16MHz_10kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_10kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_10kBPS_CFG3;
              break;

            case (defs.CAN_20KBPS):
              cfg1 = defs.MCP_16MHz_20kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_20kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_20kBPS_CFG3;
              break;

            case (defs.CAN_25KBPS):
              cfg1 = defs.MCP_16MHz_25kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_25kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_25kBPS_CFG3;
              break;

            case (defs.CAN_31K25BPS):
              cfg1 = defs.MCP_16MHz_31k25BPS_CFG1;
              cfg2 = defs.MCP_16MHz_31k25BPS_CFG2;
              cfg3 = defs.MCP_16MHz_31k25BPS_CFG3;
              break;

            case (defs.CAN_33KBPS):
              cfg1 = defs.MCP_16MHz_33kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_33kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_33kBPS_CFG3;
              break;

            case (defs.CAN_40KBPS):
              cfg1 = defs.MCP_16MHz_40kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_40kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_40kBPS_CFG3;
              break;

            case (defs.CAN_50KBPS):
              cfg1 = defs.MCP_16MHz_50kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_50kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_50kBPS_CFG3;
              break;

            case (defs.CAN_80KBPS):
              cfg1 = defs.MCP_16MHz_80kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_80kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_80kBPS_CFG3;
              break;

            case (defs.CAN_83K3BPS):
              cfg1 = defs.MCP_16MHz_83k3BPS_CFG1;
              cfg2 = defs.MCP_16MHz_83k3BPS_CFG2;
              cfg3 = defs.MCP_16MHz_83k3BPS_CFG3;
              break;

            case (defs.CAN_95KBPS):
              cfg1 = defs.MCP_16MHz_95kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_95kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_95kBPS_CFG3;
              break;

            case (defs.CAN_100KBPS):
              cfg1 = defs.MCP_16MHz_100kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_100kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_100kBPS_CFG3;
              break;

            case (defs.CAN_125KBPS):
              cfg1 = defs.MCP_16MHz_125kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_125kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_125kBPS_CFG3;
              break;

            case (defs.CAN_200KBPS):
              cfg1 = defs.MCP_16MHz_200kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_200kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_200kBPS_CFG3;
              break;

            case (defs.CAN_250KBPS):
              cfg1 = defs.MCP_16MHz_250kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_250kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_250kBPS_CFG3;
              break;

            case (defs.CAN_500KBPS):
              cfg1 = defs.MCP_16MHz_500kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_500kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_500kBPS_CFG3;
              break;

            case (defs.CAN_666KBPS):
              cfg1 = defs.MCP_16MHz_666kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_666kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_666kBPS_CFG3;
              break;

            case (defs.CAN_1000KBPS):
              cfg1 = defs.MCP_16MHz_1000kBPS_CFG1;
              cfg2 = defs.MCP_16MHz_1000kBPS_CFG2;
              cfg3 = defs.MCP_16MHz_1000kBPS_CFG3;
              break;

            default:
              set = 0;
              break;
          }
          break;

        case (defs.MCP_8MHz):
          switch (canSpeed) {
            case (defs.CAN_5KBPS):
              cfg1 = defs.MCP_8MHz_5kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_5kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_5kBPS_CFG3;
              break;

            case (defs.CAN_10KBPS):
              cfg1 = defs.MCP_8MHz_10kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_10kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_10kBPS_CFG3;
              break;

            case (defs.CAN_20KBPS):
              cfg1 = defs.MCP_8MHz_20kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_20kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_20kBPS_CFG3;
              break;

            case (defs.CAN_31K25BPS):
              cfg1 = defs.MCP_8MHz_31k25BPS_CFG1;
              cfg2 = defs.MCP_8MHz_31k25BPS_CFG2;
              cfg3 = defs.MCP_8MHz_31k25BPS_CFG3;
              break;

            case (defs.CAN_40KBPS):
              cfg1 = defs.MCP_8MHz_40kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_40kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_40kBPS_CFG3;
              break;

            case (defs.CAN_50KBPS):
              cfg1 = defs.MCP_8MHz_50kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_50kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_50kBPS_CFG3;
              break;

            case (defs.CAN_80KBPS):
              cfg1 = defs.MCP_8MHz_80kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_80kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_80kBPS_CFG3;
              break;

            case (defs.CAN_100KBPS):
              cfg1 = defs.MCP_8MHz_100kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_100kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_100kBPS_CFG3;
              break;

            case (defs.CAN_125KBPS):
              cfg1 = defs.MCP_8MHz_125kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_125kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_125kBPS_CFG3;
              break;

            case (defs.CAN_200KBPS):
              cfg1 = defs.MCP_8MHz_200kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_200kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_200kBPS_CFG3;
              break;

            case (defs.CAN_250KBPS):
              cfg1 = defs.MCP_8MHz_250kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_250kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_250kBPS_CFG3;
              break;

            case (defs.CAN_500KBPS):
              cfg1 = defs.MCP_8MHz_500kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_500kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_500kBPS_CFG3;
              break;

            case (defs.CAN_1000KBPS):
              cfg1 = defs.MCP_8MHz_1000kBPS_CFG1;
              cfg2 = defs.MCP_8MHz_1000kBPS_CFG2;
              cfg3 = defs.MCP_8MHz_1000kBPS_CFG3;
              break;

            default:
              set = 0;
              break;
          }
          break;

        default:
          set = 0;
          break;
      }

      if (set) {
        this.mcp2515_setRegister(defs.MCP_CNF1, cfg1)
          .then(() => this.mcp2515_setRegister(defs.MCP_CNF2, cfg2))
          .then(() => this.mcp2515_setRegister(defs.MCP_CNF3, cfg3))
          .then(() => resolve(defs.MCP2515_OK));
      } else {
        reject(defs.MCP2515_FAIL);
      }
    });
  }
  mcp2515_initCANBuffers() {
    const promises = [];
    for (let i = 0; i < 14; i++) { // in-buffer loop
      promises.push(this.mcp2515_setRegister(defs.MCP_TXB0CTRL + i, 0));
      promises.push(this.mcp2515_setRegister(defs.MCP_TXB1CTRL + i, 0));
      promises.push(this.mcp2515_setRegister(defs.MCP_TXB2CTRL + i, 0));
    }
    promises.push(this.mcp2515_setRegister(defs.MCP_RXB0CTRL, 0));
    promises.push(this.mcp2515_setRegister(defs.MCP_RXB1CTRL, 0));
    return Promise.all(promises);
  }
  readRxTxStatus() {
    return this.mcp2515_readStatus().then(stat => {
      let ret = (stat & (defs.MCP_STAT_TXIF_MASK | defs.MCP_STAT_RXIF_MASK));
      ret = (ret & defs.MCP_STAT_TX0IF ? defs.MCP_TX0IF : 0) |
        (ret & defs.MCP_STAT_TX1IF ? defs.MCP_TX1IF : 0) |
        (ret & defs.MCP_STAT_TX2IF ? defs.MCP_TX2IF : 0) |
        (ret & defs.MCP_STAT_RXIF_MASK); // Rx bits happend to be same on status and MCP_CANINTF
      return ret;
    })
  }
  mcp2515_read_canMsg(buffer_load_addr) {
    return new Promise((resolve, reject) => {

      let bufData = []; //4
      let writeToBus = [buffer_load_addr];

      for (let i = 0; i < 4; i++) writeToBus.push(0); // 4 byte of bufData
      writeToBus.push(0); // msgsize
      for (let i = 0; /*i < len && */ i < defs.CAN_MAX_CHAR_IN_MESSAGE; i++) writeToBus.push(0); // dataOut

      this.spi_readwrite(writeToBus)
        .then(data => {
          for (let i = 0; i < 4; i++) {
            bufData[i] = data[i + 1];
          }

          let id = (bufData[defs.MCP_SIDH] << 3) + (bufData[defs.MCP_SIDL] >> 5);
          let extended = false;
          if ((bufData[defs.MCP_SIDL] & defs.MCP_TXB_EXIDE_M) == defs.MCP_TXB_EXIDE_M) {
            /* extended id */
            id = (id << 2) + (bufData[defs.MCP_SIDL] & 0x03);
            id = (id << 8) + bufData[defs.MCP_EID8];
            id = (id << 8) + bufData[defs.MCP_EID0];
            extended = true;
          }

          let msgSize = data[5];
          let len = msgSize & defs.MCP_DLC_MASK;
          let rtrBit = (msgSize & defs.MCP_RTR_MASK) ? true : false;
          let dataOut = [];
          for (let i = 0; i < len && i < defs.CAN_MAX_CHAR_IN_MESSAGE; i++) {
            dataOut[i] = data[6 + i];
          }

          resolve({
            id: id,
            ext: extended,
            rtr: rtrBit,
            size: msgSize,
            data: rtrBit ? null : dataOut,
          });
        });
    });
  }
  mcp2515_getNextFreeTXBuf() { // get Next free txbuf
    return this.mcp2515_readStatus()
      .then(status => {
        status = status & defs.MCP_STAT_TX_PENDING_MASK
        if (status == defs.MCP_STAT_TX_PENDING_MASK) {
          throw defs.MCP_ALLTXBUSY; // All buffers are pending
        }

        return new Promise((resolve, reject) => {
          // check all 3 TX-Buffers except reserved
          let allBusy = true;
          for (let i = 0; i < defs.MCP_N_TXBUFFERS - this.nReservedTx; i++) {
            if ((status & this.txStatusPendingFlag(i)) == 0) {
              // let txbuf_n = this.txCtrlReg(i) + 1; // return SIDH-address of Buffer
              this.mcp2515_modifyRegister(defs.MCP_CANINTF, this.txIfFlag(i), 0)
                .then(() => resolve(this.txCtrlReg(i) + 1));
              allBusy = false;
            }
          }
          allBusy && reject(defs.MCP_ALLTXBUSY);
        })
      })
  }
  mcp2515_id_to_buf(ext, id) {
    let canid = id & 0x0FFFF;
    let tbufdata = [0, 0, 0, 0];

    if (ext) {
      tbufdata[defs.MCP_EID0] = canid & 0xFF;
      tbufdata[defs.MCP_EID8] = canid >> 8;
      canid = id >> 16;
      tbufdata[defs.MCP_SIDL] = canid & 0x03;
      tbufdata[defs.MCP_SIDL] += (canid & 0x1C) << 3;
      tbufdata[defs.MCP_SIDL] |= defs.MCP_TXB_EXIDE_M;
      tbufdata[defs.MCP_SIDH] = canid >> 5;
    }
    else {
      tbufdata[defs.MCP_SIDH] = canid >> 3;
      tbufdata[defs.MCP_SIDL] = (canid & 0x07) << 5;
      tbufdata[defs.MCP_EID0] = 0;
      tbufdata[defs.MCP_EID8] = 0;
    }
    return tbufdata;
  }
  mcp2515_start_transmit(mcp_addr) { // start transmit
    return this.spi_readwrite(this.txSidhToRTS(mcp_addr));
  }
  mcp2515_write_canMsg(buffer_sidh_addr, id, ext, rtrBit, len, buf) {
    len = Math.min(len, 8);
    len = Math.max(len, 0);
    let load_addr = this.txSidhToTxLoad(buffer_sidh_addr);

    let tbufdata = this.mcp2515_id_to_buf(ext, id);
    let dlc = len | (rtrBit ? defs.MCP_RTR_MASK : 0);

    let dataSend = [load_addr];
    dataSend = dataSend.concat(tbufdata);
    dataSend.push(dlc);
    for (let i = 0; i < len && i < defs.CAN_MAX_CHAR_IN_MESSAGE; i++) {
      dataSend.push(buf[i]);
    }
    this.spi_readwrite(dataSend)
      .then(() => this.mcp2515_start_transmit(buffer_sidh_addr))
  }
  readMsgBufID(status) {
    return new Promise((resolve, reject) => {
      if (status & defs.MCP_RX0IF) { // Msg in Buffer 0
        resolve(this.mcp2515_read_canMsg(defs.MCP_READ_RX0));
      }
      else if (status & defs.MCP_RX1IF) { // Msg in Buffer 1
        resolve(this.mcp2515_read_canMsg(defs.MCP_READ_RX1));
      } else {
        reject(defs.CAN_NOMSG);
      }
    });
  }
  txStatusPendingFlag(i) {
    switch (i) {
      case 0:
        return defs.MCP_STAT_TX0_PENDING;
      case 1:
        return defs.MCP_STAT_TX1_PENDING;
      case 2:
        return defs.MCP_STAT_TX2_PENDING;
    }
    return 0xff;
  }
  txCtrlReg(i) {
    switch (i) {
      case 0:
        return defs.MCP_TXB0CTRL;
      case 1:
        return defs.MCP_TXB1CTRL;
      case 2:
        return defs.MCP_TXB2CTRL;
    }
    return defs.MCP_TXB2CTRL;
  }
  statusToTxBuffer(status) {
    switch (status) {
      case defs.MCP_TX0IF:
        return 0;
      case defs.MCP_TX1IF:
        return 1;
      case defs.MCP_TX2IF:
        return 2;
    }
    return 0xff;
  }
  statusToTxSidh(status) {
    switch (status) {
      case defs.MCP_TX0IF:
        return defs.MCP_TXB0SIDH;
      case defs.MCP_TX1IF:
        return defs.MCP_TXB1SIDH;
      case defs.MCP_TX2IF:
        return defs.MCP_TXB2SIDH;
    }
    return 0;
  }
  txSidhToRTS(sidh) {
    switch (sidh) {
      case defs.MCP_TXB0SIDH:
        return defs.MCP_RTS_TX0;
      case defs.MCP_TXB1SIDH:
        return defs.MCP_RTS_TX1;
      case defs.MCP_TXB2SIDH:
        return defs.MCP_RTS_TX2;
    }
    return 0;
  }
  txSidhToTxLoad(sidh) {
    switch (sidh) {
      case defs.MCP_TXB0SIDH:
        return defs.MCP_LOAD_TX0;
      case defs.MCP_TXB1SIDH:
        return defs.MCP_LOAD_TX1;
      case defs.MCP_TXB2SIDH:
        return defs.MCP_LOAD_TX2;
    }
    return 0;
  }
  txIfFlag(i) {
    switch (i) {
      case 0:
        return defs.MCP_TX0IF;
      case 1:
        return defs.MCP_TX1IF;
      case 2:
        return defs.MCP_TX2IF;
    }
    return 0;
  }

  // Public functions
  begin(speedset, clockset) {
    if (typeof clockset === 'undefined') {
      clockset = defs.MCP_16MHz;
    }

    return new Promise((resolve, reject) => {
      Promise.resolve()
        .then(() => this.mcp2515_reset())

        .then(() => this.mcp2515_setCANCTRL_Mode(defs.MODE_CONFIG))
        .then(() => {
          this.cout('Enter setting mode success');
        })
        .catch(error => {
          this.cout('Enter setting mode fail');
          throw error;
        })

        .then(() => this.mcp2515_configRate(speedset, clockset))
        .then(() => {
          this.cout('set rate success');
        })
        .catch(error => {
          this.cout('set rate fail');
          throw error;
        })

        .then(() => this.mcp2515_initCANBuffers())// init canbuffers
        .then(() => this.mcp2515_setRegister(defs.MCP_CANINTE, defs.MCP_RX0IF | defs.MCP_RX1IF))// interrupt mode
        // enable both receive-buffers to receive messages with std. and ext. identifiers and enable rollover
        .then(() => this.mcp2515_modifyRegister(defs.MCP_RXB0CTRL, defs.MCP_RXB_RX_MASK | defs.MCP_RXB_BUKT_MASK, defs.MCP_RXB_RX_STDEXT | defs.MCP_RXB_BUKT_MASK))
        .then(() => this.mcp2515_modifyRegister(defs.MCP_RXB1CTRL, defs.MCP_RXB_RX_MASK, defs.MCP_RXB_RX_STDEXT))

        .then(() => this.setMode(defs.MODE_NORMAL))
        .then(() => {
          this.cout('Enter Normal Mode Success');
        })
        .catch(error => {
          this.cout('Enter Normal Mode Fail');
          throw error;
        })

        .then(() => {
          resolve(defs.CAN_OK);
        })
        .catch(error => {
          reject(defs.CAN_FAILINIT);
        })
    })
  }
  checkReceive() {
    return this.mcp2515_readStatus()
      .then(status => (status & defs.MCP_STAT_RXIF_MASK) ? defs.CAN_MSGAVAIL : defs.CAN_NOMSG);
  }
  readMsgBuf() {
    return this.readRxTxStatus().then(rxstat => this.readMsgBufID(rxstat))
  }
  sendMsgBuf(id, ext, rtrBit, len, buf) {
    let txbuf_n;
    return Promise.resolve()
      .then(() =>
        new Promise((resolve, reject) => { // Get txbuf_n
          let timeOut = 0;
          const loop = () => {
            this.mcp2515_getNextFreeTXBuf()
              .then(txbuf => {
                txbuf_n = txbuf
                resolve();
              })
              .catch(error => {
                if (timeOut++ < defs.TIMEOUTVALUE) {
                  sleep.usleep(10);
                  loop();
                } else {
                  reject(defs.CAN_GETTXBFTIMEOUT);
                }
              });
          }
          loop();
        })
      )
      .then(() => this.mcp2515_write_canMsg(txbuf_n, id, ext, rtrBit, len, buf))
      .then(() =>
        new Promise((resolve, reject) => {
          let timeOut = 0;
          const loop = () => {
            this.mcp2515_readRegister(txbuf_n - 1).then(res1 => {
              if (!(res1 & 0x08)) {
                resolve(defs.CAN_OK);
              } else if (timeOut++ < defs.TIMEOUTVALUE) {
                sleep.usleep(10);
                loop();
              } else {
                reject(defs.CAN_GETTXBFTIMEOUT);
              }
            });
          }
          loop();
        })
      )
  }
}

module.exports = PiCan;
