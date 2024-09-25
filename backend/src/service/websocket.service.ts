import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer, IncomingMessage, ServerResponse } from 'http';
import { createLogger } from '@util/logger.utils';

const logger = createLogger('<Websocket Service>');

interface UserSocketMap {
  [userId: string]: WebSocket;
}

type CustomHTTPServer = HTTPServer<typeof IncomingMessage, typeof ServerResponse> & {
  on(event: string, listener: (...args: any[]) => void): CustomHTTPServer;
};

class WebSocketService {
  private wss: WebSocketServer;
  private userSockets: UserSocketMap = {};

  constructor(server: CustomHTTPServer) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        const parsedMessage = JSON.parse(message);
        const userId = parsedMessage.userId;

        if (userId) {
          this.addUser(userId, ws);
          logger.info(`Websocket service - user ${userId} has connected`);
        }
      });

      ws.on('close', () => {
        logger.info('Client disconnected');
        this.removeUserBySocket(ws);
      });
    });
  }

  addUser(userId: string, socket: WebSocket) {
    this.userSockets[userId] = socket;
  }

  removeUserBySocket(socket: WebSocket) {
    for (const userId in this.userSockets) {
      if (this.userSockets[userId] === socket) {
        delete this.userSockets[userId];
        break;
      }
    }
  }

  // Method to send data to a specific user
  sendToUser(userId: string, data: object) {
    const message = JSON.stringify(data);
    const client = this.userSockets[userId];
    if (client && client.readyState === WebSocket.OPEN) {
      logger.info(`Sending message to client: ${message}`);
      client.send(message);
    }
  }

  // Broadcast data to all connected clients
  broadcast(data: object) {
    const message = JSON.stringify(data);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export default WebSocketService;
