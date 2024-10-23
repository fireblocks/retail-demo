import { TransactionRequest, TransferPeerPathType } from '@fireblocks/ts-sdk';
import { Request, Response } from 'express';

import { fireblocksCosignerService } from '@service/fireblocks/cosigner.service';
import { createLogger } from '@util/logger.utils';
import { feeService } from '@service/fee.service';
import { vaultConfig } from '@util/vaultConfig';
import { randomUUID } from 'crypto';

const logger = createLogger('<Cosigner Controller>');
export class CosignerController {
    static async getCosignerData(req: Request, res: Response) {
        const cosignerData = await fireblocksCosignerService.getAllCosignerData();
        res.status(200).send(cosignerData);
    }

    static async getCosignerApiKeys(req: Request, res: Response) {
        const cosignerApiKeys = await fireblocksCosignerService.getApiKeys(req.params.cosignerId);
        res.status(200).send(cosignerApiKeys);
    }

    static async getAllCosignerData(req: Request, res: Response) {
        const cosignerData = await fireblocksCosignerService.getAllCosignerData();
        res.status(200).send(cosignerData);
    }

    static async getAllApiKeys(req: Request, res: Response) {
        const apiKeys = await fireblocksCosignerService.getApiKeys(req.params.cosignerId);
        res.status(200).send(apiKeys);
    }

    static async getApiKey(req: Request, res: Response) {
        const apiKey = await fireblocksCosignerService.getApiKey(req.params.apiKeyId, req.params.cosignerId);
        res.status(200).send(apiKey);
    }
}


