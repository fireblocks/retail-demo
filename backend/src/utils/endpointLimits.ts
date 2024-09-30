export const endpointLimits = {
  
  // Create and Get transactions
  '/v1/transactions': {
    GET: 100,
    POST: 180
  },
  // Create Vault Accounts
  '/v1/vault/accounts': {
    POST: 100
  },
  // Get Vault 
  '/v1/vault/accounts/:param': {
    GET: 180,
  },
  // Create vault wallet
  '/v1/vault/accounts/:param/:param': {
    GET: 180,
    POST: 100
  },
   // Estimate Tx Fee
  '/v1/estimate_fee': {
    POST: 20
  },
  // Create deposit address
  '/v1/vault/accounts/:param/:param/addresses' : {
    POST: 100
  }
};
