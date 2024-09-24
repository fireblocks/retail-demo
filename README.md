<p align="center">
  <img src="./logo.svg" width="350" alt="accessibility text">
</p>
<div align="center">

  [Fireblocks Developer Portal](https://developers.fireblocks.com) </br>
  [Fireblocks Sandbox Sign-up](https://www.fireblocks.com/developer-sandbox-sign-up/) <br/><br/>
  <h1> Fireblocks Retail App Demo </h1>
</div>
<br/>


> :warning: **Warning:** 
> This code is intended solely as a reference and is **NOT** production-ready. 
> It should not be used directly in a production environment. 
> Fireblocks assumes no responsibility for any financial loss or other damages resulting from the use of this code in production.**


## Fireblocks Retail Demo Application - Work in Progress!

The Fireblocks Retail Demo application is designed to support Fireblocks clients by serving as a reference model for their integration processes. It embodies the best practices that Fireblocks advocates for building secure, retail-facing solutions.

This demo aims to accelerate and simplify the integration of Fireblocks into your projects, ensuring that you adhere to the recommended best practices when building on the Fireblocks platform.

### Overview

- **Frontend**: Built with Next.js, this frontend application serves as a retail cryptocurrency platform, providing features like portfolio dashboards, multi-asset wallet management, and transaction handling. It leverages Fireblocks for secure asset management, offering a comprehensive example of a retail-facing crypto solution.
- **Backend**: Developed with Node.js (Express.js), the backend handles essential operations such as user authentication, wallet and asset management, and transaction processing. It integrates with a MySQL database to store user data locally and communicates with the Fireblocks API for wallet and transaction operations.

To experience the full capabilities of this demo, please ensure the backend application is running before interacting with the frontend. This setup is essential for enabling user login and performing various actions.

### Running the application:
1. Run FE without Docker (locally with npm run dev) - check the `./frontend/README` for instructions
2. Run BE without Docker (locally with npm start) - check the `./backned/README` for instructions
3. Run FE + BE with Docker - Make sure you have Docker and Docker Compose installed!
    - Update both `./frontend/.env` and `./backend/.env` files according to the relevant instructions (described in the corresponding README files)
    - Navigate to the root directory containing the `docker-compose.yml` file
    - Run: `docker-compose up --build`


### Backend Application Details

This backend application showcases how to integrate Fireblocks' services into a typical retail-facing scenario. Key features include:

- User authentication (supports Local, Google, and GitHub)
- Wallet creation and management
- Asset creation and balance tracking
- Transaction processing
- WebSocket integration for real-time updates
- Integration with Fireblocks API for vault account and transaction management

For more detailed information, please refer to the [Backend README](./backend).

### Frontend Application Details

The frontend, named **FireX**, is a retail cryptocurrency demo platform built with Next.js and MobX, and integrated with Fireblocks for secure asset management. This project serves as a comprehensive reference for integrating Fireblocks into retail-facing applications.

**FireX** includes features such as a portfolio dashboard, multi-asset wallet management, and a transaction system with Fireblocks integration for secure transfers.

For more detailed information, please refer to the [Frontend README](./frontend).