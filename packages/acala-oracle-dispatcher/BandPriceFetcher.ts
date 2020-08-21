import { FetcherInterface } from '@open-web3/fetcher';
const BandChain = require('@bandprotocol/bandchain.js');

const endpoint = 'http://guanyu-devnet.bandchain.org/rest';
const oracleScriptID = 13;
const minCount = 3;
const askCount = 4;
const gasAmount = 100;
const gasLimit = 1000000;

const multiplier: 1_000_000 = 1_000_000;

const fetch = async (pair: string, mnemonic: string) => {
  try {
    const bandchain = new BandChain(endpoint);
    const oracleScript = await bandchain.getOracleScript(oracleScriptID);
    const [base_symbol, quote_symbol] = pair.split('/');
    const requestID = await bandchain.submitRequestTx(
      oracleScript,
      { base_symbol, quote_symbol, aggregation_method: 'median', multiplier },
      { minCount, askCount },
      mnemonic,
      'from_acala'
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
