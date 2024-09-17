import 'dotenv/config';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const WALLET = `${BACKEND_BASE_URL}/wallet`
export const getAssetsUrl = (walletId: string) => `${WALLET}/${walletId}/assets`;
export const AUTH = `${BACKEND_BASE_URL}/auth`
export const SUPPORTED_ASSETS = `${BACKEND_BASE_URL}/supported-assets`
export const TRANSCATIONS = `${BACKEND_BASE_URL}/transactions`