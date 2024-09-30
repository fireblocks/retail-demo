import { RateLimiter } from 'limiter';
import { createLogger } from './logger.utils';
import { EndpointLimit } from '../types/interfaces';

export class FireblocksRateLimiter {
  private limiters: Map<string, RateLimiter>;
  private logger: ReturnType<typeof createLogger>;

  constructor(private endpointLimits: EndpointLimit) {
    this.limiters = new Map();
    this.logger = createLogger('<Rate Limiter>');

    for (const [endpoint, methodLimits] of Object.entries(endpointLimits)) {
      for (const [method, limit] of Object.entries(methodLimits)) {
        const key = `${method}:${endpoint}`;
        this.limiters.set(key, new RateLimiter({ tokensPerInterval: limit, interval: 'minute' }));
      }
    }
  }

  async throttle(endpoint: string, method: string): Promise<void> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const key = `${method}:${normalizedEndpoint}`;
    const limiter = this.limiters.get(key);
    if (!limiter) {
      this.logger.warn(`No rate limit defined for endpoint: ${method} ${normalizedEndpoint}`);
      return;
    }

    const remainingRequests = await limiter.removeTokens(1);
    if (remainingRequests < 0) {
      const timeToWait = Math.abs(remainingRequests) * 60 * 1000;
      this.logger.warn(`Rate limit reached for ${method} ${normalizedEndpoint}. Waiting ${timeToWait} ms.`);
      if (process.env.NODE_ENV !== 'test') {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
    }
  }

  private normalizeEndpoint(endpoint: string): string {
    const parts = endpoint.split('/').filter(Boolean);
    let bestMatch = '';
    let bestMatchParts = 0;

    for (const definedEndpoint of Object.keys(this.endpointLimits)) {
      const definedParts = definedEndpoint.split('/').filter(Boolean);
      if (definedParts.length > parts.length) continue;

      let matches = true;
      for (let i = 0; i < definedParts.length; i++) {
        if (definedParts[i] !== parts[i] && definedParts[i] !== ':param') {
          matches = false;
          break;
        }
      }

      if (matches && definedParts.length > bestMatchParts) {
        bestMatch = definedEndpoint;
        bestMatchParts = definedParts.length;
      }
    }

    return bestMatch || endpoint;
  }
}