import { FetcherInterface } from '@open-web3/fetcher';
const BandChain = require('@bandprotocol/bandchain.js');

const endpoint = 'http://poa-api.bandchain.org';

const fetch = async (pairs: string[]) => {
  try {
    const bandchain = new BandChain(endpoint);
    const result: { currency: any; price: string }[] = (
      await bandchain.getReferenceData(pairs)
    ).map(({ pair, rate }: { pair: string; rate: number }) => ({ currency: pair, price: rate.toString() }));

    return JSON.stringify(result);
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
