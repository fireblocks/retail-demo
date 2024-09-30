import { BasePath, Fireblocks } from '@fireblocks/ts-sdk';
import { readFileSync } from 'fs';
import { FireblocksRateLimiter } from '@util/rateLimiter';
import { endpointLimits } from '@util/endpointLimits';
import axios from 'axios';
import { randomUUID } from 'crypto';
require('dotenv').config();

const pathToSecret = process.env.FIREBLOCKS_PATH_TO_SECRET;
const secretKey = readFileSync(pathToSecret!, 'utf8');
const apiKey = process.env.FIREBLOCKS_API_KEY_ID;

class ApiClient {
  public fireblocksClient: Fireblocks;
  private rateLimiter: FireblocksRateLimiter;

  constructor(basePath?: BasePath) {
    this.rateLimiter = new FireblocksRateLimiter(endpointLimits);

    try {
      const axiosInstance = axios.create({
        timeout: 30000,
      });

      // Add a request interceptor to handle rate limiting and Idempotency-Key
      axiosInstance.interceptors.request.use(async (config) => {
        const endpoint = config.url?.split('?')[0] || '';
        const method = config.method?.toUpperCase() || 'GET';
        await this.rateLimiter.throttle(endpoint, method);

        // Add Idempotency-Key header for POST requests, except for /v1/transactions
        if (method === 'POST' && !endpoint.endsWith('/v1/transactions')) {
          config.headers['Idempotency-Key'] = randomUUID();
        }

        return config;
      });

      this.fireblocksClient = new Fireblocks({
        apiKey,
        secretKey,
        basePath: basePath || BasePath.US,
        additionalOptions: {
          userAgent: 'retail-demo',
          baseOptions: {
            httpAgent: axiosInstance,
          },
        },
      });
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

const apiClient = new ApiClient();
export default apiClient;
