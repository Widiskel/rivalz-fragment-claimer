import { Twisters } from "twisters";
import logger from "./logger.js";
import { Rivalz } from "../core/rivalz.js";
import { account } from "../../account.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters({});
  }

  /**
   * @param {string} acc
   * @param {Rivalz} rivalz
   * @param {string} msg
   * @param {string} delay
   */
  log(msg = "", acc = "", rivalz = new Rivalz(), delay) {
    if (delay == undefined) {
      logger.info(`Account ${account.indexOf(acc) + 1} - ${msg}`);
      delay = "-";
    }

    const wallet = rivalz.wallet ?? {};
    const address = wallet.address ?? "-";
    const balance = rivalz.balance ?? "-";
    const ETHBalance = balance.ETH ?? "-";

    this.twisters.put(acc, {
      text: `
================= Account ${account.indexOf(acc) + 1} =============
Address             : ${address}
Balance             : ${ETHBalance} ETH

Status : ${msg}
Delay  : ${delay}
==============================================`,
    });
  }

  clear(acc) {
    this.twisters.remove(acc);
  }

  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  cleanInfo() {
    this.twisters.remove(2);
  }
}
export default new Twist();
