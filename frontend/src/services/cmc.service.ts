import { Asset } from '@/lib/types';
import axios from 'axios';
import 'dotenv/config';

const CMC_API_KEY = process.env.CMC_API_KEY
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

interface PriceData {
  [symbol: string]: {
    quote: {
      USD: {
        price: number;
      };
    };
  };
}

function normalizeAssetSymbol(assetId: string): string {
  if (assetId === 'ETH_TEST5') return 'ETH';
  return assetId.replace('_TEST', '');
}

export async function calculateTotalUSDValue(assets: Asset[]): Promise<number> {
  console.log('Calculating total USD value for assets:', assets);

  if (assets.length === 0) {
    console.log('No assets found');
    return 0;
  }

  const symbols = assets.map(asset => normalizeAssetSymbol(asset.assetId)).join(',');
  console.log('Fetching prices for symbols:', symbols);

  try {
    const response = await axios.get('/api/getCryptoPrice', {
      params: { symbols },
    });

    console.log('API response:', response.data);

    const priceData: PriceData = response.data.data;

    const totalValue = assets.reduce((total, asset) => {
      const symbol = normalizeAssetSymbol(asset.assetId);
      const price = priceData[symbol].quote.USD.price;
      const amount = parseFloat(asset.balance);
      const assetValue = amount * price;
      console.log(`Asset: ${asset.assetId}, Amount: ${amount}, Price: $${price}, Value: $${assetValue}`);
      return total + assetValue;
    }, 0);

    console.log('Total USD value:', totalValue);
    return totalValue;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw error;
  }
}