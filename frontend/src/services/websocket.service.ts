import assetStore from "@/store/supportedAssetsStore";
import terminalStore from "@/store/terminalStore";
import transactionStore from "@/store/transactionStore";
import walletStore from "@/store/walletStore";

type MessageHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  message: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();

  connect(url: string, userId: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = this.handleOpen.bind(this, userId);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onerror = this.handleError.bind(this);
  }

  private handleOpen(userId: string): void {
    console.log('WebSocket connected');
    this.sendMessage({ userId });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      terminalStore.addLog(JSON.stringify(message, null, 2));
      
      this.dispatchMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(): void {
    console.log('WebSocket disconnected');
    // Implement reconnection logic here if needed
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
  }

  private dispatchMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message.message));
  }

  addMessageHandler(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  removeMessageHandler(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      this.messageHandlers.set(type, handlers.filter(h => h !== handler));
    }
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  }
}

const webSocketService = new WebSocketService();

webSocketService.addMessageHandler('balance_update', (message) => {
  if (typeof message.amount === 'string' || typeof message.amount === 'number') {
    walletStore.updateBalance(message.assetId, message.amount);
  } else {
    console.error('Invalid amount in balance_update message:', message);
  }
});

webSocketService.addMessageHandler('new_address', (message) => {
  walletStore.addAddress(message.assetId, message.address);
});

webSocketService.addMessageHandler('transaction_status', (message) => {
  console.log('Transaction status update:', message);
  transactionStore.updateTransactionStatus(message)
});

webSocketService.addMessageHandler('new_incoming_transaction', (message) => {
  console.log('New Incoming transaction:', message);
  transactionStore.addTransaction(message)
});

export default webSocketService;
