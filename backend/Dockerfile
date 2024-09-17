FROM node:20

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Build your application
RUN npm run build

EXPOSE 3000

# Use ts-node to run your application
CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/app.ts"]