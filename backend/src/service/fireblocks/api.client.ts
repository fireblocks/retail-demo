import { BasePath, Fireblocks } from '@fireblocks/ts-sdk';
import { readFileSync } from 'fs';
require('dotenv').config();

const pathToSecret = process.env.FIREBLOCKS_PATH_TO_SECRET;
const secretKey = readFileSync(pathToSecret!, 'utf8');
const apiKey = process.env.FIREBLOCKS_API_KEY_ID;

class ApiClient {
  public fireblocksClient: Fireblocks;

  constructor(basePath?: BasePath) {
    try {
      this.fireblocksClient = new Fireblocks({
        apiKey,
        secretKey,
        basePath: basePath || BasePath.US,
        additionalOptions: {
          userAgent: 'retail-demo',
        },
      });
    } catch (error) {
      throw error.response.data;
    }
  }
}
const apiClient = new ApiClient();
export default apiClient;
