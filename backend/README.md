
<p align="center">
  <img src="../logo.svg" width="350" alt="accessibility text">
</p>
<div align="center">

  [Fireblocks Developer Portal](https://developers.fireblocks.com) </br>
  [Fireblocks Sandbox Sign-up](https://www.fireblocks.com/developer-sandbox-sign-up/) <br/><br/>
  <h1> Fireblocks Retail App Demo Backend </h1>
</div>
<br/>

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
   - Fields: id, assetId, assetName, address, isSwept, balance, vaultAccount, wallet

4. **Transaction**: Represents a cryptocurrency transaction.
   - Fields: id, assetId, status, fireblocksTxId, txHash, amount, isSweeping, sourceVaultAccount, wallet, destinationVaultAccount, sourceExternalAddress, destinationExternalAddress, outgoing, createdAt

5. **VaultAccount**: Represents a Fireblocks vault account.
   - Fields: id, fireblocksVaultId, name, assets, balance, sourceTransactions, destinationTransactions

6. **WalletAssetBalance**: Represents the balance of an asset in a wallet.
   - Fields: id, wallet, assetId, totalBalance, incomingPendingBalance, outgoingPendingBalance

7. **SupportedAssets**: Represents the list of the assets supported by the demo application.
   - Fields: id, explorerUrl, fireblocksAssetId, depositCounter, name

## Services

1. **AuthService**: Handles user authentication and creation.
   - Description: The AuthService provides the functionality for user authentication and login with email & password  / GoogleOAuth2 / GitHub userId.
2. **AssetService**: Handles balance updates for assets records of the application's users.
3. **WalletService**: Manages wallet-related operations.
4. **VaultService**: Interacts with Fireblocks vault accounts.
5. **TransactionService**: Handles transaction-related operations.
6. **ApiClient**: Handles the initialization of a Fireblocks API Client using environment variables.
- Description: This service handles the creation of the Fireblocks API Client that is used by the app to interact with the Fireblocks API gateway. More information can be found [here](https://developers.fireblocks.com/reference/typescript-sdk#your-first-fireblocks-typescript-code-example).
7. **FireblocksTransactionService**: Interacts with Fireblocks API for transaction creation and processing.
- Description: This services wraps primary endpoints of the Fireblocks SDK to provide the required transactions related functionality for the demo app. More information on the endpoint can be found [here](https://developers.fireblocks.com/reference/gettransactions).
8. **FireblocksVaultAccountService**: Interacts with Fireblocks API for vault account related operations.
- Description: This service wraps several endpoints of the Fireblocks SDK and provides vault account related functionality to the demo application. It manages vault account creation and updates as well as asset wallet and deposit address creation for users on the Fireblocks workspace. More information on the endpoint can be found [here](https://developers.fireblocks.com/reference/createvaultaccount).
9. **ConsolidationService**: Manages UTXO asset deposits, monitors their count, and initiates UTXO consolidations in the omnibus vault account
- Description: This service handles all the functionality around UTXO asset deposits consolidations. It will update the deposit counter for each supported UTXO asset, per deposit and will trigger a consolidation Tx to burn small unspent inputs on the omnibus wallet to allow high withdrawal availability for users. Additionally, the service has an automated job that runs periodically to act as a backup to the deposits-triggered process and prevent a situation where more than 250 UTXOs are stored in the omnibus wallet. More information about UTXO consolidation can be found [here](https://developers.fireblocks.com/reference/consolidate-utxos).
10. **FeeService**: Handles the functionality to obtain the Tx estimations from Fireblocks API and calculates the required fee for a withdrawal Tx.
More information can be found [here](https://developers.fireblocks.com/reference/estimate-transaction-fee).
11. **SweepingService**: Handles the functionality for sweeping account-based asset deposits from intermediate vault accounts to the omnibus vault account.
- Description: This service acts as a job that runs periodically and checks for balances in the intermediate deposit vault accounts created for users, once a balance above the sweeping threshold is found a sweeping Tx is triggered to accumulate all user deposits of account-based assets into the omnibus vault account. More information can be found [here](https://developers.fireblocks.com/reference/sweep-to-omnibus-1).
12. **WebhookService**: Handles balance updates for user deposits based on the webhooks events sent from Fireblocks.
13. **WebSocketService**: Manages real-time communication with clients.

## Setup and Configuration
Please refer to the root project [README.md](../README.md) file for setup & configuration instructions.

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

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.