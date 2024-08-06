import { ethers } from "ethers";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { account } from "../../account.js";
import { API } from "../api/api.js";
import { RPC } from "./rpc.js";
import { Config } from "../config/config.js";
import { Fragment } from "./fragment.js";
import { ContractTransactionResponse } from "ethers";

export class Rivalz extends API {
  constructor(acc) {
    super("https://be.rivalz.ai/api-v1");

    this.acc = acc;
    this.provider = RPC.provider;
    this.attempt = 0;
    this.maxRetries = Config.maxErrorCount;
    this.ok = false;
  }

  async connectWallet() {
    try {
      const data = this.acc.replace(/^0x/, "");
      await Helper.delay(
        1000,
        this.acc,
        `Connecting to Account : ${account.indexOf(this.acc) + 1}`,
        this
      );
      const type = Helper.determineType(data);
      logger.info(`Account Type : ${type}`);
      if (type == "Secret Phrase") {
        /**
         * @type {Wallet}
         */
        this.wallet = new ethers.Wallet.fromPhrase(data, this.provider);
      } else if (type == "Private Key") {
        /**
         * @type {Wallet}
         */
        this.wallet = new ethers.Wallet(data.trim(), this.provider);
      } else {
        throw Error("Invalid account Secret Phrase or Private Key");
      }
      await Helper.delay(
        1000,
        this.acc,
        `Wallet connected ${JSON.stringify(this.wallet.address)}`,
        this
      );
    } catch (error) {
      throw error;
    }
  }

  async getBalance(update = false) {
    try {
      if (!update) {
        await Helper.delay(
          500,
          this.acc,
          `Getting Wallet Balance of ${this.wallet.address}`,
          this
        );
      }
      const ethBalance = ethers.formatEther(
        await this.provider.getBalance(this.wallet.address)
      );

      this.balance = {
        ETH: ethBalance,
      };
      if (!update) {
        await Helper.delay(
          500,
          this.acc,
          `Sucessfully Get Wallet Balance of ${this.wallet.address}`,
          this
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async claimFragment(itr, total) {
    try {
      this.claimError = false;
      await Helper.delay(
        500,
        this.acc,
        `Claiming Fragment ${itr} of ${total}...`,
        this
      );
      const fragmentContract = new ethers.Contract(
        Fragment.FRAGMENTCONTRACTADDRESS,
        Fragment.FRAGMENTABI,
        this.wallet
      );

      const res = await fragmentContract.claim();
      await this.printTx(res);

      await Helper.delay(500, this.acc, `Sucessfully Claim Fragment`, this);
    } catch (error) {
      await Helper.delay(
        5000,
        this.acc,
        `Error during claim fragment, posibly all fragment claimed or not enough fee`,
        this
      );
      this.claimError = true;
    }
  }

  async executeTx(tx) {
    try {
      await Helper.delay(500, this.acc, `Building Tx...`, this);
      logger.info(`TX : ${JSON.stringify(Helper.serializeBigInt(tx))}`);
      const txRes = await this.wallet.sendTransaction(tx);
      await Helper.delay(500, this.acc, `Transaction Sended ...`, this);
      await Helper.delay(
        500,
        this.acc,
        `Waiting Transaction Confirmation ...`,
        this
      );
      const txRev = await txRes.wait();
      logger.info(JSON.stringify(Helper.serializeBigInt(txRev)));
      await Helper.delay(
        2000,
        this.acc,
        `Transaction Success \nhttps://rivalz2.explorer.caldera.xyz/tx/${txRev.hash}`,
        this
      );
      await this.getBalance(true);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {ContractTransactionResponse} tx
   */
  async printTx(tx) {
    logger.info(`TX : ${JSON.stringify(Helper.serializeBigInt(tx))}`);
    if (tx.hash) {
      await Helper.delay(500, this.acc, `Transaction Sended ...`, this);
      await Helper.delay(
        500,
        this.acc,
        `Waiting Transaction Confirmation ...`,
        this
      );
      await Helper.delay(
        2000,
        this.acc,
        `Transaction Success \nhttps://rivalz2.explorer.caldera.xyz/tx/${tx.hash}`,
        this
      );
    } else {
      throw Error("Error executing TX");
    }
  }
}
