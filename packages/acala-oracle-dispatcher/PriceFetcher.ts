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
  private readonly fetchers: { [key: string]: FetcherInterface };
  private readonly symbols: string[];

  constructor() {
    this.symbols = config.symbols;

    this.fetchers = this.symbols
      .map((symbol) => {
        const fetchers = config.exchanges[symbol].map((exchange) => createFetcher(exchange));
        return { [symbol]: new CombinedFetcher(fetchers, 1) };
      })
      .reduce((acc, x) => {
        const key = Object.keys(x)[0];
        return { ...acc, [key]: x[key] };
      });
  }

  async fetchPrices(): Promise<{ currency: any; price: string }[]> {
    const res = [];
    for (let symbol of this.symbols) {
      const price = await this.fetchers[symbol].getPrice(symbol);
      const [base] = symbol.split('/');
      res.push((CURRENCIES[base] || [base]).map((currency) => ({ currency, price })));
    }
    return res.reduce((acc, val) => acc.concat(val), []);
  }
}
