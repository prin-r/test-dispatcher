import { FetcherInterface } from '@open-web3/fetcher';
const BandChain = require('@bandprotocol/bandchain.js');

const endpoint = 'http://poa-api.bandchain.org';
const bandchain = new BandChain(endpoint);

// This function receive ["BTC/USD", "DOT/USD"] and then return
// [
//    { currency: 'XBTC', price: BTC/USD price },
//    { currency: 'RENBTC', price: BTC/USD price },
//    { currency: 'DOT', price: DOT/USD price },
// ]
const fetch = async (pairs: string[]) => {
  try {
    const result: { currency: any; price: string }[] = (
      await bandchain.getReferenceData(pairs)
    ).map(({ pair, rate }: { pair: string; rate: number }) => ({ currency: pair, price: rate.toString() }));

    // get btc price obj from the result array
    const btc = result.find(({ currency }) => currency === 'BTC/USD');
    if (!btc) {
      throw 'BTC is falsy';
    }

    // make a new array with no btc price obj inside
    const withoutBTC = result.filter(({ currency }) => currency !== 'BTC/USD');

    // return a new array that adds xbtc and renbtc, but use the price of btc instead
    return JSON.stringify([
      ...withoutBTC,
      { currency: 'XBTC', price: btc.price },
      { currency: 'RENBTC', price: btc.price }
    ]);
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
