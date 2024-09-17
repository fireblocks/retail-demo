import { NextResponse } from 'next/server';
import axios from 'axios';
import 'dotenv/config';

const CMC_API_KEY = process.env.CMC_API_KEY;
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json({ error: 'Symbols are required' }, { status: 400 });
  }

  try {
    const response = await axios.get(CMC_API_URL, {
      params: { symbol: symbols },
      headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching price data:', error);
    return NextResponse.json({ error: 'Error fetching price data' }, { status: 500 });
  }
}