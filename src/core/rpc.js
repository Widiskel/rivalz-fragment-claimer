import { ethers } from "ethers";

export class RPC {
  static RPC_URL = "https://rivalz2.rpc.caldera.xyz/http";
  static provider = new ethers.JsonRpcProvider(this.RPC_URL);
}
