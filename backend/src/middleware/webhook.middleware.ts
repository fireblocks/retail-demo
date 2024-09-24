import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@util/logger.utils';

const logger = createLogger();

export const validateWebhook =
  (publicKey: string) => (req: Request, res: Response, next: NextFunction) => {
    logger.info('In validate Webhook middleware!');
    const message = JSON.stringify(req.body);
    const signature = req.headers['fireblocks-signature'];

    if (typeof signature !== 'string') {
      next(new Error(`Invalid signature header in the request`));
      return;
    }

    const verifier = crypto.createVerify('RSA-SHA512');
    verifier.write(message);
    verifier.end();

    const isVerified = verifier.verify(publicKey, signature, 'base64');
    if (isVerified) {
      logger.info('Got a new webhook:\n', JSON.stringify(message));
      next();
    } else {
      next(new Error(`Invalid signature`));
    }
  };
