import { account } from "./account.js";
import { Config } from "./src/config/config.js";
import { Rivalz } from "./src/core/rivalz.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(acc) {
  try {
    const rivalz = new Rivalz(acc);
    await rivalz.connectWallet();
    await rivalz.getBalance();

    let itr = 1;
    for (const claim of Array(Config.fragmentToClaim)) {
      await rivalz.claimFragment(itr, Array(Config.fragmentToClaim).length);
      itr += 1;
      if (rivalz.claimError) {
        break;
      }
    }

    await Helper.delay(
      10000,
      acc,
      `All Fragment Claimed and Account ${
        account.indexOf(acc) + 1
      } Processing Complete...`,
      rivalz
    );
    twist.clear(acc);
  } catch (error) {
    await Helper.delay(
      5000,
      acc,
      `Error processing Accoung ${account.indexOf(acc) + 1} : ${JSON.stringify(
        error
      )}`
    );
  }
}

/** Processing Bot */
async function process() {
  logger.clear();
  logger.info(`BOT STARTED`);
  for (const acc of account) {
    await operation(acc);
  }
  logger.info(`BOT FINISHED`);
  twist.cleanInfo();
  await Helper.delay(
    60000 * 60 * 24,
    undefined,
    `All Account processed Delaying for ${Helper.msToTime(60000 * 60 * 24)}`
  );
  twist.cleanInfo();
  await process();
}

(async () => {
  console.log("Rivalz Fragment Claimer Bot");
  console.log("By : Widiskel");
  console.log("Note : Don't forget to run git pull to keep up-to-date");
  console.log();
  await process();
})();
