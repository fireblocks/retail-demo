# Fireblocks Retail Demo Application

## Overview

This application is a retail demo for Fireblocks, designed to showcase the integration of Fireblocks' services with a typical retail facing use-case. It provides functionality for user authentication, wallet management, asset handling, and transaction processing.

## Features

- User authentication (Local, Google, and GitHub strategies)
- Wallet creation and management
- Asset creation and balance tracking
- Transaction processing
- WebSocket integration for real-time updates
- Integration with Fireblocks API for vault account management and transactions

## Technology Stack

- Node.js
- TypeScript
- Express.js
- TypeORM
- MySQL
- Passport.js for authentication
- WebSocket for real-time communication
- Docker for containerization

## Models

1. **User**: Represents a user of the application.
   - Fields: id, email, name, googleId, githubId, password, wallet

2. **Wallet**: Represents a user's wallet.
   - Fields: id, name, user, assets, transactions, assetBalances, description

3. **Asset**: Represents a cryptocurrency asset.
   - Fields: id, assetId, assetName, explorerUrl, logoUrl, address, isSwept, balance, vaultAccount, wallet

4. **Transaction**: Represents a cryptocurrency transaction.
   - Fields: id, assetId, status, fireblocksTxId, txHash, amount, isSweeping, sourceVaultAccount, wallet, destinationVaultAccount, sourceExternalAddress, destinationExternalAddress

5. **VaultAccount**: Represents a Fireblocks vault account.
   - Fields: id, fireblocksVaultId, name, assets

6. **WalletAssetBalance**: Represents the balance of an asset in a wallet.
   - Fields: id, wallet, assetId, totalBalance, incomingPendingBalance, outgoingPendingBalance

## Services

1. **AuthService**: Handles user authentication and creation.
2. **WalletService**: Manages wallet-related operations.
3. **VaultService**: Interacts with Fireblocks vault accounts.
4. **TransactionService**: Handles transaction-related operations.
5. **FireblocksTransactionService**: Interacts with Fireblocks API for transaction processing.
6. **WebSocketService**: Manages real-time communication with clients.

## Setup and Configuration

### Fireblocks API Key Setup

1. Create a `keys` directory in the root of the project if it doesn't exist already.

2. Place your Fireblocks API private key file in the `keys` directory.

3. In your `.env` file, set the `FIREBLOCKS_PATH_TO_SECRET` variable to point to your key file:
   ```
   FIREBLOCKS_PATH_TO_SECRET=./keys/your_secret_key_file_name.key
   ```
   Replace `your_secret_key_file_name.key` with the actual name of your key file.


Note: The Docker setup will automatically include the `keys` directory in the container, ensuring that the application can access your Fireblocks API key.
Make sure that you also run the front-end applicaiton that can be found [here](https://github.com/fireblocks/retail-demo-fe)

###
1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory and add the necessary variables (see Environment Variables section below).

3. Build the Docker image:
   ```
   docker build -t fireblocks-retail-demo .
   ```

4. Run the Docker container:
   ```
   docker-compose up
   ```
5. Configure a local tunneling like `ngrok` or `exposed` to recieve webhooks. The webhook endpoint is exposed at `/webhook` path which means that you need to configure your Webhook in Fireblocks with the base URL you get from the local tunneling tool + /webhook at the end

6. Alternatively you can run it without Docker if you have MySQL installed locally.

### Environment Variables

The application uses several environment variables for configuration. These are stored in a `.env` file in the root directory. Here's a detailed explanation of each variable:

### Database Configuration
- `DB_NAME`: Name of the MySQL database (default: retail_demo)
- `DB_USER`: MySQL user (default: root)
- `DB_PASSWORD`: MySQL password
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 3306)

### Authentication
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GIT_CLIENT_ID`: GitHub OAuth client ID
- `GIT_CLIENT_SECRET`: GitHub OAuth client secret 
- `JWT_SECRET_KEY`: Secret key for JWT token generation
- `JWT_REFRESH_KEY`: Secret key for JWT refresh token generation

### Fireblocks Configuration
- `FIREBLOCKS_API_KEY`: Your Fireblocks API key
- `FIREBLOCKS_PATH_TO_SECRET`: Path to your Fireblocks secret key file

### Application Settings
- `PORT`: Port on which the server will run (default: 3000)
- `FRONTEND_BASE_URL`: URL of the frontend application

### Vault Configuration
- `OMNIBUS_VAULT`: ID of the Omnibus vault in Fireblocks
- `WITHDRAWAL_VAULTS`: Comma-separated IDs of withdrawal vaults in Fireblocks

### Setup Script Behavior

The setup script uses the `OMNIBUS_VAULT` and `WITHDRAWAL_VAULTS` variables to determine whether to create new vault accounts or use existing ones:

1. If `OMNIBUS_VAULT` is empty:
   - The script will create a new vault account in Fireblocks called "Omnibus Vault".
   - It will then create a BTC_TEST wallet in this vault account.

2. If `OMNIBUS_VAULT` contains a value:
   - The script will use the provided vault ID as the Omnibus vault.
   - It will not create a new vault account in Fireblocks.

3. If `WITHDRAWAL_VAULTS` is empty:
   - The script will create three new vault accounts in Fireblocks named "Withdrawal Vault #1", "#2", and "#3".
   - It will create SOL_TEST, ETH_TEST5, and BTC_TEST wallets in each of these vault accounts.

4. If `WITHDRAWAL_VAULTS` contains a comma-separated list of vault IDs:
   - The script will use these IDs as the withdrawal vaults.
   - It will not create new vault accounts in Fireblocks.

This flexibility allows you to either use existing vault accounts or let the application create new ones. If you're using existing vault accounts, make sure to set the appropriate IDs in the .env file before running the application for the first time.

Note: The setup script runs only once when the database is empty. If you need to re-run the setup, you'll need to clear the existing data from the database.

## Running the Application

1. The application will be available at `http://localhost:3000`.
2. On first run, the setup script will create the necessary vault accounts and assets in Fireblocks (if not provided in the .env file).
3. You can now use the API endpoints to interact with the application.

## API Endpoints

- `/auth`: Authentication routes (login, signup, Google auth, GitHub auth)
- `/wallet`: Wallet management routes
- `/transaction`: Transaction processing routes

## WebSocket

The application uses WebSocket for real-time updates. Clients can connect to the WebSocket server to receive updates about transactions and wallet balances.

## Notes

- Ensure that you have the necessary Fireblocks API credentials and have set up the required vault accounts in your Fireblocks console.
- The application uses a setup script to initialize the required vault accounts and assets. This script runs on the first startup.
- Make sure to secure your environment variables and API keys when deploying to production.
- Make sure to put assets in the withdrawal vault accounts before actually trying to create withdrawals.

## Contributing

Please read the CONTRIBUTING.md file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.