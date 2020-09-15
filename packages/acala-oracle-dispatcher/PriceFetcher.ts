import { CombinedFetcher, CCXTFetcher, CryptoCompareFetcher, FetcherInterface } from '@open-web3/fetcher';
import config from './config';
import BandPriceFetcher from './BandPriceFetcher';

const CURRENCIES: { [key: string]: string[] } = {
  BTC: ['XBTC', 'RENBTC'],
  DOT: ['DOT']
};

const createFetcher = (exchange: string): FetcherInterface => {
  if (exchange === 'CryptoCompare') {
    return new CryptoCompareFetcher('CCCAGG', config.cryptoCompareApiKey);
  }

  if (exchange === 'BandProtocol') {
    return new BandPriceFetcher(config.bandMnemonic);
  }

  if (exchange.startsWith('CCXT')) {
    const [, exchangeName] = exchange.split(':');
    return new CCXTFetcher(exchangeName);
  }

  throw Error('Unknown exchange');
};

export default class PriceFetcher {
  private readonly fetcher: FetcherInterface;
  private readonly symbols: string[];

  constructor() {
    this.symbols = config.symbols;
    this.fetcher = new BandPriceFetcher(config.bandMnemonic);
  }

  async fetchPrices(): Promise<{ currency: any; price: string }[]> {
    const prices = await this.fetcher.getPrice(JSON.stringify(this.symbols));
    return JSON.parse(prices).map(({ currency, price }: { currency: any; price: string }) => {
      let [base, _] = currency.split('/');
      if (base === 'BTC') {
        base = 'XBTC';
      }
      return { currency: base, price };
    });
  }
}
