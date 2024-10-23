import {
  Cosigner,
  CosignersBetaApi,
  ApiKey,
  ApiKeysPaginatedResponse,
  CosignersPaginatedResponse,
  GetApiKeysOrderEnum
} from '@fireblocks/ts-sdk';
import apiClient from './api.client';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Fireblocks Cosigner Service>');

class FireblocksCosignerService {
  private cosignerAPI: CosignersBetaApi;

  constructor() {
  }

  async getAllCosignerData(): Promise<CosignersPaginatedResponse | undefined> {
    try {
      let response = await apiClient.fireblocksClient.cosignersBeta.getCosigners()
      return response.data;
    } catch (error) {
      logger.error('Error fetching all cosigner data:', error);
      throw error;
    }
  }

  async getApiKey(apiKeyId: string, cosignerId: string): Promise<ApiKey> {
    try {
      const response = await this.cosignerAPI.getApiKey({ apiKeyId, cosignerId});
      return response.data;
    } catch (error) {
      logger.error(`Error fetching API key ${apiKeyId}:`, error);
      throw error;
    }
  }

  async getApiKeys(cosignerId: string, order?: GetApiKeysOrderEnum, pageCursor?: string, pageSize?: number ): Promise<ApiKeysPaginatedResponse> {
    try {
      const orders = order || GetApiKeysOrderEnum.Desc
      const response = await this.cosignerAPI.getApiKeys({
        cosignerId,
        order: orders,
        pageCursor,
        pageSize
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching API keys:', error);
      throw error;
    }
  }

  async getCosigner(cosignerId: string): Promise<Cosigner> {
    try {
      const response = await this.cosignerAPI.getCosigner({
        cosignerId
      })
      return response.data;
    } catch (error) {
      logger.error(`Error fetching cosigner ${cosignerId}:`, error);
      throw error;
    }
  }

}

export const fireblocksCosignerService = new FireblocksCosignerService();
