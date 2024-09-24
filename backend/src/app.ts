import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '@route/auth.route';
import webhookRouter from '@route/webhook.route';
import transactionRouter from '@route/transaction.route';
import supportedAssetRouter from '@route/supportedAssets.route';
import walletRouter from '@route/wallet.route';
import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './data-source';
import session from 'express-session';
import passport from '@middleware/passport.middleware';
import { createServer } from 'http';
import WebSocketService from '@service/websocket.service';
import { sweepingService, consolidationService } from '@service';
import { setupScript } from './setupScript';
import { createLogger } from '@util/logger.utils';
import { vaultConfig } from '@util/vaultConfig';

const omnibusVaultAccountId = vaultConfig.getOmnibusVaultId()

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

// Create an HTTP server to use with Express and WebSocket
const server = createServer(app);

// Initialize the WebSocket service
export const webSocketService = new WebSocketService(server);

// Initialize DB
AppDataSource.initialize()
  .then(async () => {
    logger.info('Database connection has been initialized!');

    // Run setup script after database initialization
    await setupScript();

    // Start the server
    server.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    logger.error(`Error during database connection initialization: ${err}`);
  });

// Initialize and start the sweeping service
sweepingService.initiateSweeping();


// Initialize the consolidation backup process
consolidationService.backupProcess(omnibusVaultAccountId);