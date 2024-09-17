import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '@route/auth.route';
import webhookRouter from '@route/webhook.route';
import transactionRouter from '@route/transaction.route';
import supportedAssetRouter from "@route/supportedAssets.route";
import walletRouter from '@route/wallet.route';
import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './data-source';
import session from 'express-session';
import passport from '@middleware/passport.middleware';
import { createServer } from 'http';
import WebSocketService from '@service/websocket.service';
import { SweepingService } from '@service/sweeping.service';
import { setupScript } from './setupScript';

const port = process.env.PORT || 3000;
const app = express();

app.use(cors({
  origin: 'http://localhost:3001', 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection has been initialized!');
  })
  .catch((err) => {
    console.error('Error during database connection initialization:', err);
  });

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

// Initialize and start the sweeping service
const sweepingService = new SweepingService();
sweepingService.initiateSweeping();

// Run setup script before starting the server
setupScript().then(() => {
  // Start the server
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error("Failed to run setup script:", error);
  process.exit(1);
});
