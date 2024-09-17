import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const validateWebhook =
  (publicKey: string) => (req: Request, res: Response, next: NextFunction) => {
    console.log('In validate Webhook middleware!');
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
      console.log('Got a new webhook:\n', JSON.stringify(message, null, 2));
      next();
    } else {
      next(new Error(`Invalid signature`));
    }
  };
