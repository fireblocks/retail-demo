import { Router } from 'express';
import { validateWebhook } from '../middleware/webhook.middleware';
import { WebhookController } from '../controller/webhook.controller';

const publicKey = process.env.WEBHOOK_PUB_KEY;

const route = Router();
route.post(
  '/',
  validateWebhook(publicKey!),
  WebhookController.handleWebhookMessage
);

export default route;
