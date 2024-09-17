
<p align="center">
  <img src="../logo.svg" width="350" alt="accessibility text">
</p>
<div align="center">

  [Fireblocks Developer Portal](https://developers.fireblocks.com) </br>
  [Fireblocks Sandbox Sign-up](https://www.fireblocks.com/developer-sandbox-sign-up/) <br/><br/>
  <h1> FireX - Fireblocks Retail App Demo Frontend </h1>
</div>
<br/>


FireX is a retail cryptocurrency demo platform built with Next.js, MobX, and integrated with Fireblocks for secure asset management. This project aims to provide a reference for Fireblocks integration when building applications to serve retail facing use cases.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Setup and Installation](#setup-and-installation)
6. [Running the Application](#running-the-application)
7. [API Integration](#api-integration)
8. [State Management](#state-management)
9. [Styling and UI Components](#styling-and-ui-components)
10. [Authentication and Security](#authentication-and-security)
11. [Troubleshooting](#troubleshooting)
12. [License](#license)

## Project Overview

FireX is designed to provide a comprehensive solution for retail crypto users. It offers a dashboard for portfolio overview, wallet management for multiple assets, and a transaction system integrated with Fireblocks for secure transfers.

## Features

- User authentication and authorization
- Dashboard with portfolio overview
- Multi-asset wallet management
- Secure transactions using Fireblocks integration
- Real-time asset price updates
- Transaction history and tracking
- Responsive design for desktop and mobile use

## Technology Stack

- Frontend: Next.js (React framework)
- State Management: MobX
- Styling: Tailwind CSS
- UI Components: Custom components and Shadcn UI
- API Calls: Axios
- Websockets: Custom implementation
- Backend Integration: RESTful API (assumed to be provided separately)
- Asset Management: Fireblocks SDK (integrated through backend)

## Project Structure

The project follows a modular structure:

frontend/
├── src/
│ ├── app/ # Next.js app router pages
│ ├── components/ # Reusable React components
│ ├── foundation/ # UI foundation components
│ ├── lib/ # Utility functions and constants
│ ├── providers/ # React context providers
│ ├── services/ # API and external service integrations
│ ├── store/ # MobX stores for state management
│ └── styles/ # Global styles and Tailwind config
├── public/ # Static assets
├── .env # Environment variables
├── next.config.js # Next.js configuration
└── package.json # Project dependencies and scripts


## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/firex.git
   cd firex
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
   ```
   NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3000
   CMC_API_KEY=your_coinmarketcap_api_key
   ```

4. Ensure you have Node.js (version 14 or later) and npm installed on your system.

## Running the Application

1. Make sure to run the Backend application first. Nothing will work if the BE is not running - [Retail BE Demo](https://github.com/fireblocks/retail-demo-be)

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3001` to view the application.

4. For production build:
   ```
   npm run build
   npm start
   ```

## API Integration

The `apiService.ts` file in the `services` directory handles all API calls. To add new API endpoints:

1. Add the endpoint URL to `src/lib/constants.ts`.
2. Create a new method in `apiService.ts` using Axios for the API call.
3. Use the new method in your components or stores as needed.

## State Management

MobX is used for state management. Each major feature has its own store (e.g., `walletStore`, `authStore`). To add a new store:

1. Create a new file in the `src/store` directory.
2. Define your store class and use `makeAutoObservable` for reactivity.
3. Export an instance of your store.

## Styling and UI Components

- Use Tailwind CSS for styling. Custom styles can be added in `src/styles/globals.css`.
- Reusable UI components are located in the `src/foundation` directory.
- For new components, create them in the appropriate subdirectory of `src/components`.

## Authentication and Security

- User authentication is handled by the `authStore`.
- Implement proper error handling and validation in forms and API calls.
- Use HTTPS in production and secure your API endpoints.

## Troubleshooting

- If you encounter CORS issues, ensure your backend is configured to accept requests from your frontend's origin.
- For state-related issues, check the MobX store implementations and ensure proper use of `observer` HOC.
- For build errors, make sure all dependencies are correctly installed and TypeScript types are properly defined.

## License

This project is licensed under the MIT License. See the LICENSE file for details.