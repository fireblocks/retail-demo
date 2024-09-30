import { FireblocksRateLimiter } from '@util/rateLimiter';
import { endpointLimits } from '@util/endpointLimits';

jest.mock('limiter', () => ({
  RateLimiter: jest.fn().mockImplementation(() => {
    let tokens = 100;
    return {
      removeTokens: jest.fn().mockImplementation((count) => {
        tokens -= count;
        return Promise.resolve(tokens);
      }),
    };
  }),
}));

const mockWarn = jest.fn();

jest.mock('@util/logger.utils', () => ({
  createLogger: jest.fn(() => ({
    warn: mockWarn,
  })),
}));

describe('FireblocksRateLimiter', () => {
  let rateLimiter: FireblocksRateLimiter;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    rateLimiter = new FireblocksRateLimiter(endpointLimits);
  });

  it('should allow requests within the rate limit', async () => {
    await rateLimiter.throttle('/v1/transactions', 'GET');
    await rateLimiter.throttle('/v1/transactions', 'GET');
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it('should throttle requests exceeding the rate limit', async () => {
    for (let i = 0; i < 101; i++) {
      await rateLimiter.throttle('/v1/transactions', 'GET');
    }
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('Rate limit reached for GET /v1/transactions'));
  });

  it('should handle different methods separately', async () => {
    await rateLimiter.throttle('/v1/transactions', 'GET');
    await rateLimiter.throttle('/v1/transactions', 'GET');
    await rateLimiter.throttle('/v1/transactions', 'POST');
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it('should log a warning for undefined endpoints', async () => {
    await rateLimiter.throttle('/undefined', 'GET');
    expect(mockWarn).toHaveBeenCalledWith('No rate limit defined for endpoint: GET /undefined');
  });

  it('should simulate rate limit reset after one minute', async () => {
    for (let i = 0; i < 100; i++) {
      await rateLimiter.throttle('/v1/transactions', 'GET');
    }
    await rateLimiter.throttle('/v1/transactions', 'GET');
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('Rate limit reached for GET /v1/transactions'));
    
    jest.clearAllMocks();
    rateLimiter = new FireblocksRateLimiter(endpointLimits);
    
    await rateLimiter.throttle('/v1/transactions', 'GET');
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it('should handle complex endpoints with multiple parameters', async () => {
    for (let i = 0; i < 100; i++) {
      await rateLimiter.throttle(`/v1/vault/accounts/account${i}/BTC/addresses`, 'POST');
    }
    expect(mockWarn).not.toHaveBeenCalled();

    await rateLimiter.throttle('/v1/vault/accounts/oneMore/ETH/addresses', 'POST');
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('Rate limit reached for POST /v1/vault/accounts/:param/:param/addresses'));
  });
});