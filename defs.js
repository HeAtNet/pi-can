/*
    Created by Attila Herczog according to arduino CAN_BUS_Shield library.
    
    Original author:Loovee (loovee@seeed.cc)
    2014-1-16
    mcp_can_dfs.h
*/

// Begin mt

module.exports.TIMEOUTVALUE = 50;
module.exports.MCP_SIDH = 0;
module.exports.MCP_SIDL = 1;
module.exports.MCP_EID8 = 2;
module.exports.MCP_EID0 = 3;

module.exports.MCP_TXB_EXIDE_M = 0x08                                        // In TXBnSIDL;
module.exports.MCP_DLC_MASK = 0x0F                                        // 4 LSBits;
module.exports.MCP_RTR_MASK = 0x40                                        // 1<<6 Bit 6;

module.exports.MCP_RXB_RX_ANY = 0x60;
module.exports.MCP_RXB_RX_EXT = 0x40;
module.exports.MCP_RXB_RX_STD = 0x20;
module.exports.MCP_RXB_RX_STDEXT = 0x00;
module.exports.MCP_RXB_RX_MASK = 0x60;
module.exports.MCP_RXB_BUKT_MASK = 1 << 2;


// Bits in the TXBnCTRL registers.

module.exports.MCP_TXB_TXBUFE_M = 0x80;
module.exports.MCP_TXB_ABTF_M = 0x40;
module.exports.MCP_TXB_MLOA_M = 0x20;
module.exports.MCP_TXB_TXERR_M = 0x10;
module.exports.MCP_TXB_TXREQ_M = 0x08;
module.exports.MCP_TXB_TXIE_M = 0x04;
module.exports.MCP_TXB_TXP10_M = 0x03;

module.exports.MCP_TXB_RTR_M = 0x40                                        // In TXBnDLC;
module.exports.MCP_RXB_IDE_M = 0x08                                        // In RXBnSIDL;
module.exports.MCP_RXB_RTR_M = 0x40                                        // In RXBnDLC;

module.exports.MCP_STAT_TX_PENDING_MASK = 0x54;
module.exports.MCP_STAT_TX0_PENDING = 0x04;
module.exports.MCP_STAT_TX1_PENDING = 0x10;
module.exports.MCP_STAT_TX2_PENDING = 0x40;
module.exports.MCP_STAT_TXIF_MASK = 0xA8;
module.exports.MCP_STAT_TX0IF = 0x08;
module.exports.MCP_STAT_TX1IF = 0x20;
module.exports.MCP_STAT_TX2IF = 0x80;
module.exports.MCP_STAT_RXIF_MASK = 0x03;
module.exports.MCP_STAT_RX0IF = 1 << 0;
module.exports.MCP_STAT_RX1IF = 1 << 1;

module.exports.MCP_EFLG_RX1OVR = 1 << 7;
module.exports.MCP_EFLG_RX0OVR = 1 << 6;
module.exports.MCP_EFLG_TXBO = 1 << 5;
module.exports.MCP_EFLG_TXEP = 1 << 4;
module.exports.MCP_EFLG_RXEP = 1 << 3;
module.exports.MCP_EFLG_TXWAR = 1 << 2;
module.exports.MCP_EFLG_RXWAR = 1 << 1;
module.exports.MCP_EFLG_EWARN = 1 << 0;
module.exports.MCP_EFLG_ERRORMASK = 0xF8                                      // 5 MS-Bits;

// Define MCP2515 register addresses

module.exports.MCP_RXF0SIDH = 0x00;
module.exports.MCP_RXF0SIDL = 0x01;
module.exports.MCP_RXF0EID8 = 0x02;
module.exports.MCP_RXF0EID0 = 0x03;
module.exports.MCP_RXF1SIDH = 0x04;
module.exports.MCP_RXF1SIDL = 0x05;
module.exports.MCP_RXF1EID8 = 0x06;
module.exports.MCP_RXF1EID0 = 0x07;
module.exports.MCP_RXF2SIDH = 0x08;
module.exports.MCP_RXF2SIDL = 0x09;
module.exports.MCP_RXF2EID8 = 0x0A;
module.exports.MCP_RXF2EID0 = 0x0B;
module.exports.MCP_BFPCTRL = 0x0C;
module.exports.MCP_TXRTSCTRL = 0x0D;
module.exports.MCP_CANSTAT = 0x0E;
module.exports.MCP_CANCTRL = 0x0F;
module.exports.MCP_RXF3SIDH = 0x10;
module.exports.MCP_RXF3SIDL = 0x11;
module.exports.MCP_RXF3EID8 = 0x12;
module.exports.MCP_RXF3EID0 = 0x13;
module.exports.MCP_RXF4SIDH = 0x14;
module.exports.MCP_RXF4SIDL = 0x15;
module.exports.MCP_RXF4EID8 = 0x16;
module.exports.MCP_RXF4EID0 = 0x17;
module.exports.MCP_RXF5SIDH = 0x18;
module.exports.MCP_RXF5SIDL = 0x19;
module.exports.MCP_RXF5EID8 = 0x1A;
module.exports.MCP_RXF5EID0 = 0x1B;
module.exports.MCP_TEC = 0x1C;
module.exports.MCP_REC = 0x1D;
module.exports.MCP_RXM0SIDH = 0x20;
module.exports.MCP_RXM0SIDL = 0x21;
module.exports.MCP_RXM0EID8 = 0x22;
module.exports.MCP_RXM0EID0 = 0x23;
module.exports.MCP_RXM1SIDH = 0x24;
module.exports.MCP_RXM1SIDL = 0x25;
module.exports.MCP_RXM1EID8 = 0x26;
module.exports.MCP_RXM1EID0 = 0x27;
module.exports.MCP_CNF3 = 0x28;
module.exports.MCP_CNF2 = 0x29;
module.exports.MCP_CNF1 = 0x2A;
module.exports.MCP_CANINTE = 0x2B;
module.exports.MCP_CANINTF = 0x2C;
module.exports.MCP_EFLG = 0x2D;
module.exports.MCP_TXB0CTRL = 0x30;
module.exports.MCP_TXB0SIDH = 0x31;
module.exports.MCP_TXB1CTRL = 0x40;
module.exports.MCP_TXB1SIDH = 0x41;
module.exports.MCP_TXB2CTRL = 0x50;
module.exports.MCP_TXB2SIDH = 0x51;
module.exports.MCP_RXB0CTRL = 0x60;
module.exports.MCP_RXB0SIDH = 0x61;
module.exports.MCP_RXB1CTRL = 0x70;
module.exports.MCP_RXB1SIDH = 0x71;

module.exports.MCP_TX_INT = 0x1C                                    // Enable all transmit interrup ts;
module.exports.MCP_TX01_INT = 0x0C                                    // Enable TXB0 and TXB1 interru pts;
module.exports.MCP_RX_INT = 0x03                                    // Enable receive interrupts;
module.exports.MCP_NO_INT = 0x00                                    // Disable all interrupts;

module.exports.MCP_TX01_MASK = 0x14;
module.exports.MCP_TX_MASK = 0x54;


// Define SPI Instruction Set

module.exports.MCP_WRITE = 0x02;
module.exports.MCP_READ = 0x03;
module.exports.MCP_BITMOD = 0x05;
module.exports.MCP_LOAD_TX0 = 0x40;
module.exports.MCP_LOAD_TX1 = 0x42;
module.exports.MCP_LOAD_TX2 = 0x44;

module.exports.MCP_RTS_TX0 = 0x81;
module.exports.MCP_RTS_TX1 = 0x82;
module.exports.MCP_RTS_TX2 = 0x84;
module.exports.MCP_RTS_ALL = 0x87;
module.exports.MCP_READ_RX0 = 0x90;
module.exports.MCP_READ_RX1 = 0x94;
module.exports.MCP_READ_STATUS = 0xA0;
module.exports.MCP_RX_STATUS = 0xB0;
module.exports.MCP_RESET = 0xC0;


// CANCTRL Register Values

module.exports.MODE_NORMAL = 0x00;
module.exports.MODE_SLEEP = 0x20;
module.exports.MODE_LOOPBACK = 0x40;
module.exports.MODE_LISTENONLY = 0x60;
module.exports.MODE_CONFIG = 0x80;
module.exports.MODE_POWERUP = 0xE0;
module.exports.MODE_MASK = 0xE0;
module.exports.ABORT_TX = 0x10;
module.exports.MODE_ONESHOT = 0x08;
module.exports.CLKOUT_ENABLE = 0x04;
module.exports.CLKOUT_DISABLE = 0x00;
module.exports.CLKOUT_PS1 = 0x00;
module.exports.CLKOUT_PS2 = 0x01;
module.exports.CLKOUT_PS4 = 0x02;
module.exports.CLKOUT_PS8 = 0x03;


// CNF1 Register Values

module.exports.SJW1 = 0x00;
module.exports.SJW2 = 0x40;
module.exports.SJW3 = 0x80;
module.exports.SJW4 = 0xC0;


//  CNF2 Register Values

module.exports.BTLMODE = 0x80;
module.exports.SAMPLE_1X = 0x00;
module.exports.SAMPLE_3X = 0x40;


// CNF3 Register Values

module.exports.SOF_ENABLE = 0x80;
module.exports.SOF_DISABLE = 0x00;
module.exports.WAKFIL_ENABLE = 0x40;
module.exports.WAKFIL_DISABLE = 0x00;


// CANINTF Register Bits

module.exports.MCP_RX0IF = 0x01;
module.exports.MCP_RX1IF = 0x02;
module.exports.MCP_TX0IF = 0x04;
module.exports.MCP_TX1IF = 0x08;
module.exports.MCP_TX2IF = 0x10;
module.exports.MCP_ERRIF = 0x20;
module.exports.MCP_WAKIF = 0x40;
module.exports.MCP_MERRF = 0x80;

// BFPCTRL Register Bits

module.exports.B1BFS = 0x20;
module.exports.B0BFS = 0x10;
module.exports.B1BFE = 0x08;
module.exports.B0BFE = 0x04;
module.exports.B1BFM = 0x02;
module.exports.B0BFM = 0x01;

// TXRTCTRL Register Bits

module.exports.B2RTS = 0x20;
module.exports.B1RTS = 0x10;
module.exports.B0RTS = 0x08;
module.exports.B2RTSM = 0x04;
module.exports.B1RTSM = 0x02;
module.exports.B0RTSM = 0x01;

// clock

module.exports.MCP_16MHz = 1;
module.exports.MCP_8MHz = 2;

// speed 16M

module.exports.MCP_16MHz_1000kBPS_CFG1 = 0x00;
module.exports.MCP_16MHz_1000kBPS_CFG2 = 0xD0;
module.exports.MCP_16MHz_1000kBPS_CFG3 = 0x82;

module.exports.MCP_16MHz_500kBPS_CFG1 = 0x00;
module.exports.MCP_16MHz_500kBPS_CFG2 = 0xF0;
module.exports.MCP_16MHz_500kBPS_CFG3 = 0x86;

module.exports.MCP_16MHz_250kBPS_CFG1 = 0x41;
module.exports.MCP_16MHz_250kBPS_CFG2 = 0xF1;
module.exports.MCP_16MHz_250kBPS_CFG3 = 0x85;

module.exports.MCP_16MHz_200kBPS_CFG1 = 0x01;
module.exports.MCP_16MHz_200kBPS_CFG2 = 0xFA;
module.exports.MCP_16MHz_200kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_125kBPS_CFG1 = 0x03;
module.exports.MCP_16MHz_125kBPS_CFG2 = 0xF0;
module.exports.MCP_16MHz_125kBPS_CFG3 = 0x86;

module.exports.MCP_16MHz_100kBPS_CFG1 = 0x03;
module.exports.MCP_16MHz_100kBPS_CFG2 = 0xFA;
module.exports.MCP_16MHz_100kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_95kBPS_CFG1 = 0x03;
module.exports.MCP_16MHz_95kBPS_CFG2 = 0xAD;
module.exports.MCP_16MHz_95kBPS_CFG3 = 0x07;

module.exports.MCP_16MHz_83k3BPS_CFG1 = 0x03;
module.exports.MCP_16MHz_83k3BPS_CFG2 = 0xBE;
module.exports.MCP_16MHz_83k3BPS_CFG3 = 0x07;

module.exports.MCP_16MHz_80kBPS_CFG1 = 0x03;
module.exports.MCP_16MHz_80kBPS_CFG2 = 0xFF;
module.exports.MCP_16MHz_80kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_50kBPS_CFG1 = 0x07;
module.exports.MCP_16MHz_50kBPS_CFG2 = 0xFA;
module.exports.MCP_16MHz_50kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_40kBPS_CFG1 = 0x07;
module.exports.MCP_16MHz_40kBPS_CFG2 = 0xFF;
module.exports.MCP_16MHz_40kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_33kBPS_CFG1 = 0x09;
module.exports.MCP_16MHz_33kBPS_CFG2 = 0xBE;
module.exports.MCP_16MHz_33kBPS_CFG3 = 0x07;

module.exports.MCP_16MHz_31k25BPS_CFG1 = 0x0F;
module.exports.MCP_16MHz_31k25BPS_CFG2 = 0xF1;
module.exports.MCP_16MHz_31k25BPS_CFG3 = 0x85;

module.exports.MCP_16MHz_25kBPS_CFG1 = 0X0F;
module.exports.MCP_16MHz_25kBPS_CFG2 = 0XBA;
module.exports.MCP_16MHz_25kBPS_CFG3 = 0X07;

module.exports.MCP_16MHz_20kBPS_CFG1 = 0x0F;
module.exports.MCP_16MHz_20kBPS_CFG2 = 0xFF;
module.exports.MCP_16MHz_20kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_10kBPS_CFG1 = 0x1F;
module.exports.MCP_16MHz_10kBPS_CFG2 = 0xFF;
module.exports.MCP_16MHz_10kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_5kBPS_CFG1 = 0x3F;
module.exports.MCP_16MHz_5kBPS_CFG2 = 0xFF;
module.exports.MCP_16MHz_5kBPS_CFG3 = 0x87;

module.exports.MCP_16MHz_666kBPS_CFG1 = 0x00;
module.exports.MCP_16MHz_666kBPS_CFG2 = 0xA0;
module.exports.MCP_16MHz_666kBPS_CFG3 = 0x04;


// speed 8M

module.exports.MCP_8MHz_1000kBPS_CFG1 = 0x00;
module.exports.MCP_8MHz_1000kBPS_CFG2 = 0x80;
module.exports.MCP_8MHz_1000kBPS_CFG3 = 0x00;

module.exports.MCP_8MHz_500kBPS_CFG1 = 0x00;
module.exports.MCP_8MHz_500kBPS_CFG2 = 0x90;
module.exports.MCP_8MHz_500kBPS_CFG3 = 0x02;

module.exports.MCP_8MHz_250kBPS_CFG1 = 0x00;
module.exports.MCP_8MHz_250kBPS_CFG2 = 0xb1;
module.exports.MCP_8MHz_250kBPS_CFG3 = 0x05;

module.exports.MCP_8MHz_200kBPS_CFG1 = 0x00;
module.exports.MCP_8MHz_200kBPS_CFG2 = 0xb4;
module.exports.MCP_8MHz_200kBPS_CFG3 = 0x06;

module.exports.MCP_8MHz_125kBPS_CFG1 = 0x01;
module.exports.MCP_8MHz_125kBPS_CFG2 = 0xb1;
module.exports.MCP_8MHz_125kBPS_CFG3 = 0x05;

module.exports.MCP_8MHz_100kBPS_CFG1 = 0x01;
module.exports.MCP_8MHz_100kBPS_CFG2 = 0xb4;
module.exports.MCP_8MHz_100kBPS_CFG3 = 0x06;

module.exports.MCP_8MHz_80kBPS_CFG1 = 0x01;
module.exports.MCP_8MHz_80kBPS_CFG2 = 0xbf;
module.exports.MCP_8MHz_80kBPS_CFG3 = 0x07;

module.exports.MCP_8MHz_50kBPS_CFG1 = 0x03;
module.exports.MCP_8MHz_50kBPS_CFG2 = 0xb4;
module.exports.MCP_8MHz_50kBPS_CFG3 = 0x06;

module.exports.MCP_8MHz_40kBPS_CFG1 = 0x03;
module.exports.MCP_8MHz_40kBPS_CFG2 = 0xbf;
module.exports.MCP_8MHz_40kBPS_CFG3 = 0x07;

module.exports.MCP_8MHz_31k25BPS_CFG1 = 0x07;
module.exports.MCP_8MHz_31k25BPS_CFG2 = 0xa4;
module.exports.MCP_8MHz_31k25BPS_CFG3 = 0x04;

module.exports.MCP_8MHz_20kBPS_CFG1 = 0x07;
module.exports.MCP_8MHz_20kBPS_CFG2 = 0xbf;
module.exports.MCP_8MHz_20kBPS_CFG3 = 0x07;

module.exports.MCP_8MHz_10kBPS_CFG1 = 0x0f;
module.exports.MCP_8MHz_10kBPS_CFG2 = 0xbf;
module.exports.MCP_8MHz_10kBPS_CFG3 = 0x07;

module.exports.MCP_8MHz_5kBPS_CFG1 = 0x1f;
module.exports.MCP_8MHz_5kBPS_CFG2 = 0xbf;
module.exports.MCP_8MHz_5kBPS_CFG3 = 0x07;

module.exports.MCPDEBUG = 0;
module.exports.MCPDEBUG_TXBUF = 0;
module.exports.MCP_N_TXBUFFERS = 3;

module.exports.MCP_RXBUF_0 = module.exports.MCP_RXB0SIDH;
module.exports.MCP_RXBUF_1 = module.exports.MCP_RXB1SIDH;

module.exports.MCP2515_OK = 0;
module.exports.MCP2515_FAIL = 1;
module.exports.MCP_ALLTXBUSY = 2;

module.exports.CANDEBUG = 1;

module.exports.CANUSELOOP = 0;

module.exports.CANSENDTIMEOUT = 200                                            // milliseconds;

module.exports.MCP_PIN_HIZ = 0;
module.exports.MCP_PIN_INT = 1;
module.exports.MCP_PIN_OUT = 2;
module.exports.MCP_PIN_IN = 3;

module.exports.MCP_RX0BF = 0;
module.exports.MCP_RX1BF = 1;
module.exports.MCP_TX0RTS = 2;
module.exports.MCP_TX1RTS = 3;
module.exports.MCP_TX2RTS = 4;


// initial value of gCANAutoProcess

module.exports.CANAUTOPROCESS = 1;
module.exports.CANAUTOON = 1;
module.exports.CANAUTOOFF = 0;
module.exports.CAN_STDID = 0;
module.exports.CAN_EXTID = 1;
module.exports.CANDEFAULTIDENT = 0x55CC;
module.exports.CANDEFAULTIDENTEXT = module.exports.CAN_EXTID;

module.exports.CAN_5KBPS = 1;
module.exports.CAN_10KBPS = 2;
module.exports.CAN_20KBPS = 3;
module.exports.CAN_25KBPS = 4;
module.exports.CAN_31K25BPS = 5;
module.exports.CAN_33KBPS = 6;
module.exports.CAN_40KBPS = 7;
module.exports.CAN_50KBPS = 8;
module.exports.CAN_80KBPS = 9;
module.exports.CAN_83K3BPS = 10;
module.exports.CAN_95KBPS = 11;
module.exports.CAN_100KBPS = 12;
module.exports.CAN_125KBPS = 13;
module.exports.CAN_200KBPS = 14;
module.exports.CAN_250KBPS = 15;
module.exports.CAN_500KBPS = 16;
module.exports.CAN_666KBPS = 17;
module.exports.CAN_1000KBPS = 18;

module.exports.CAN_OK = 0;
module.exports.CAN_FAILINIT = 1;
module.exports.CAN_FAILTX = 2;
module.exports.CAN_MSGAVAIL = 3;
module.exports.CAN_NOMSG = 4;
module.exports.CAN_CTRLERROR = 5;
module.exports.CAN_GETTXBFTIMEOUT = 6;
module.exports.CAN_SENDMSGTIMEOUT = 7;
module.exports.CAN_FAIL = 0xff;

module.exports.CAN_MAX_CHAR_IN_MESSAGE = 8;

/*********************************************************************************************************
    END FILE
*********************************************************************************************************/
