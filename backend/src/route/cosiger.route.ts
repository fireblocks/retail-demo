import { CosignerController } from "@controller/cosigner.controller";
import { Router } from 'express';

const router = Router();

router.get(
    '/cosigner',
    CosignerController.getAllCosignerData
  )
  
  router.get(
    '/cosigner/api-keys',
    CosignerController.getAllApiKeys
  )
  
  router.get(
    '/cosigner/api-keys/:apiKeyId',
    CosignerController.getApiKey
  )
  
  router.get(
    '/cosigners',
    CosignerController.getAllCosignerData
  )
  
  export default router;