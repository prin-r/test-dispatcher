import { FetcherInterface } from '@open-web3/fetcher';
import config from './config';
import BandPriceFetcher from './BandPriceFetcher';

export default class PriceFetcher {
  private readonly fetcher: FetcherInterface;
  private readonly symbols: string[];

  constructor() {
    this.symbols = config.symbols;

    this.fetcher = new BandPriceFetcher();
  }

  async fetchPrices(): Promise<{ currency: any; price: string }[]> {
    const prices = await this.fetcher.getPrice(JSON.stringify(this.symbols));
    if (prices === '') {
      return [];
    }
    return JSON.parse(prices).map(({ currency, price }: { currency: any; price: string }) => {
      let [base, _] = currency.split('/');
      return { currency: base, price };
    });
  }
}
