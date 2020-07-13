import { FetcherInterface } from '@open-web3/fetcher';
const BandChain = require('@bandprotocol/bandchain.js');

const endpoint = 'http://guanyu-devnet.bandchain.org/rest';
const oracleScriptID = 1;
const minCount = 4;
const askCount = 4;
const gasAmount = 100;
const gasLimit = 1000000;

const multiplier: 1_000_000 = 1_000_000;

const bandchain = new BandChain(endpoint);

const fetch = async (pair: string, mnemonic: string) => {
  try {
    const oracleScript = await bandchain.getOracleScript(oracleScriptID);
    const requestID = await bandchain.submitRequestTx(
      oracleScript,
      { symbol: pair.split('/')[0], multiplier },
      { minCount, askCount },
      mnemonic,
      gasAmount,
      gasLimit
    );
    const {
      ResponsePacketData: { result }
    } = await bandchain.getRequestResult(requestID);
    return (Buffer.from(result, 'base64').reduce((a, e) => a * 256 + e, 0) / multiplier).toString();
  } catch (e) {
    console.log(e);
    return '';
  }
};

export default class BandPriceFetcher implements FetcherInterface {
  private bandMnemonic = '';
  constructor(bandMnemonic: string) {
    this.bandMnemonic = bandMnemonic;
  }

  getPrice(pair: string): Promise<string> {
    return fetch(pair, this.bandMnemonic);
  }
}
