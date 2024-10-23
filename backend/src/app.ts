import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '@route/auth.route';
import webhookRouter from '@route/webhook.route';
import cosignerRouter from '@route/cosiger.route';
import transactionRouter from '@route/transaction.route';
import supportedAssetRouter from '@route/supportedAssets.route';
import walletRouter from '@route/wallet.route';
import 'reflect-metadata';
import 'dotenv/config';
import { initializeDataSource } from './data-source';
import session from 'express-session';
import passport from '@middleware/passport.middleware';
import http from 'http';
import WebSocketService from '@service/websocket.service';
import { sweepingService, consolidationService } from '@service';
import { setupScript } from './setupScript';
import { createLogger } from '@util/logger.utils';
import { vaultConfig } from '@util/vaultConfig';



const logger = createLogger('<Main>');

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Public Routes
app.use('/auth', authRouter);
app.use('/webhook', webhookRouter);

// Authenticated Routes Middleware
const authMiddleware = passport.authenticate('jwt', { session: false });

// Apply the authMiddleware to all routes that require authentication
app.use(authMiddleware);

// Authenticated Routes
app.use('/wallet', walletRouter);
app.use('/supported-assets', supportedAssetRouter);
app.use('/transactions', transactionRouter);
app.use('/cosigner', cosignerRouter);

// Create the server without passing app to createServer
const server = http.createServer();

// Manually handle requests using the Express app
server.on('request', app);

// Initialize the WebSocket service
export const webSocketService = new WebSocketService(server); 

// Initialize DB and start server
initializeDataSource()
  .then(async () => {
    logger.info('Database connection has been initialized!');

    // Run setup script after database initialization
    await setupScript();

    // Log vault configuration
    logger.info(`Omnibus Vault ID after setup: ${vaultConfig.getOmnibusVaultId()}`);
    logger.info(`Withdrawal Vault IDs after setup: ${vaultConfig.getWithdrawalVaultIds()}`);

    // Start the server
    server.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
    });

    // Initialize and start the sweeping service
    sweepingService.initiateSweeping();

    // Initialize the consolidation backup process
    consolidationService.backupProcess(vaultConfig.getOmnibusVaultId());
  })
  .catch((err) => {
    logger.error(`Error during database connection initialization: ${err}`);
    process.exit(1);
  });