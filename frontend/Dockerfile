FROM node:20

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's source code, including .env
COPY . .

# Build the Next.js application
RUN npm run build

EXPOSE 3001

# Start the Next.js application
CMD ["npm", "start", "--", "-p", "3001"]