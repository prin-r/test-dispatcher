import { FetcherInterface } from '@open-web3/fetcher';
const BandChain = require('@bandprotocol/bandchain.js');

const endpoint = 'http://poa-api.bandchain.org';
const bandchain = new BandChain(endpoint);

const fetch = async (pairs: string[]) => {
  try {
    const result: { currency: any; price: string }[] = (
      await bandchain.getReferenceData(pairs.filter((x) => x !== 'RENBTC/USD'))
    ).map(({ pair, rate }: { pair: string; rate: number }) => ({ currency: pair, price: rate.toString() }));

    const btc = result.find(({ currency }) => currency === 'BTC/USD');
    if (!btc) {
      throw 'btc is falsy';
    }

    return JSON.stringify([...result, { currency: 'RENBTC', price: btc.price }]);
  } catch (e) {
    console.log(e);
    return '';
  }
};

export default class BandPriceFetcher implements FetcherInterface {
  getPrice(pairs: string): Promise<string> {
    return fetch(JSON.parse(pairs));
  }
}
